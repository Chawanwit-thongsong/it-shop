package store

import (
	"context"
)

// ---------- สมาชิก (admin) ----------

func (s *Store) ListMembers(ctx context.Context) ([]Member, error) {
	rows, err := s.Pool.Query(ctx,
		`SELECT `+memberCols+` FROM members ORDER BY created_at DESC, id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Member{}
	for rows.Next() {
		m, err := scanMember(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}

func (s *Store) UpdateMemberRole(ctx context.Context, id int64, role string) (Member, error) {
	return scanMember(s.Pool.QueryRow(ctx,
		`UPDATE members SET role = $2, updated_at = now() WHERE id = $1 RETURNING `+memberCols, id, role))
}

// ---------- Dashboard ----------

type LowStock struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Stock int    `json:"stock"`
}

type Stats struct {
	Products       int            `json:"products"`
	ActiveProducts int            `json:"activeProducts"`
	Members        int            `json:"members"`
	Orders         int            `json:"orders"`
	Revenue        int            `json:"revenue"` // รวมเฉพาะออเดอร์ที่จ่ายแล้ว (paid, shipped, done)
	OrdersByStatus map[string]int `json:"ordersByStatus"`
	LowStock       []LowStock     `json:"lowStock"`
	RecentOrders   []Order        `json:"recentOrders"`
}

// Stats รวมตัวเลขทั้งร้านในคำขอเดียว หน้า Dashboard ยิงครั้งเดียวจบ
func (s *Store) Stats(ctx context.Context) (Stats, error) {
	st := Stats{OrdersByStatus: map[string]int{}, LowStock: []LowStock{}}
	err := s.Pool.QueryRow(ctx,
		`SELECT (SELECT count(*) FROM products),
		        (SELECT count(*) FROM products WHERE is_active),
		        (SELECT count(*) FROM members),
		        (SELECT count(*) FROM orders),
		        (SELECT coalesce(sum(total), 0) FROM orders WHERE status IN ('paid', 'shipped', 'done'))`).
		Scan(&st.Products, &st.ActiveProducts, &st.Members, &st.Orders, &st.Revenue)
	if err != nil {
		return st, err
	}

	rows, err := s.Pool.Query(ctx, `SELECT status, count(*) FROM orders GROUP BY status`)
	if err != nil {
		return st, err
	}
	for rows.Next() {
		var status string
		var n int
		if err := rows.Scan(&status, &n); err != nil {
			rows.Close()
			return st, err
		}
		st.OrdersByStatus[status] = n
	}
	rows.Close()

	rows, err = s.Pool.Query(ctx,
		`SELECT id, name, stock FROM products WHERE is_active AND stock <= 5 ORDER BY stock, name LIMIT 10`)
	if err != nil {
		return st, err
	}
	for rows.Next() {
		var l LowStock
		if err := rows.Scan(&l.ID, &l.Name, &l.Stock); err != nil {
			rows.Close()
			return st, err
		}
		st.LowStock = append(st.LowStock, l)
	}
	rows.Close()

	recent, err := s.ListOrders(ctx, nil, "")
	if err != nil {
		return st, err
	}
	if len(recent) > 5 {
		recent = recent[:5]
	}
	st.RecentOrders = recent
	return st, nil
}
