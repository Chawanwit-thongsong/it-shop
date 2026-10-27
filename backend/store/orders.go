package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
)

var (
	ErrCartEmpty     = errors.New("cart empty")
	ErrBadTransition = errors.New("bad status transition")
)

// StockError บอกว่าสินค้าตัวไหนไม่พอ (handler เอาชื่อไปแสดงให้ผู้ใช้)
type StockError struct{ Name string }

func (e *StockError) Error() string {
	return "สินค้า " + e.Name + " มีไม่พอหรือปิดขายแล้ว"
}

// Transitions สถานะที่เปลี่ยนต่อได้ เช่น pending ไปได้แค่ paid หรือ cancelled
var Transitions = map[string][]string{
	"pending": {"paid", "cancelled"},
	"paid":    {"shipped", "cancelled"},
	"shipped": {"done"},
}

func canMove(from, to string) bool {
	for _, s := range Transitions[from] {
		if s == to {
			return true
		}
	}
	return false
}

type OrderItem struct {
	ProductID int64   `json:"productId"`
	Name      string  `json:"name"`
	UnitPrice int     `json:"unitPrice"`
	Qty       int     `json:"qty"`
	ImageURL  *string `json:"imageUrl"`
}

type Order struct {
	ID          int64       `json:"id"`
	MemberID    int64       `json:"memberId"`
	MemberName  string      `json:"memberName"`
	MemberEmail string      `json:"memberEmail"`
	Total       int         `json:"total"`
	Status      string      `json:"status"`
	ShipName    string      `json:"shipName"`
	ShipPhone   string      `json:"shipPhone"`
	ShipAddress string      `json:"shipAddress"`
	ItemCount   int         `json:"itemCount"`
	CreatedAt   time.Time   `json:"createdAt"`
	Items       []OrderItem `json:"items,omitempty"`
}

type ShipInput struct {
	ShipName    string `json:"shipName"`
	ShipPhone   string `json:"shipPhone"`
	ShipAddress string `json:"shipAddress"`
}

const orderSelect = `SELECT o.id, o.member_id, m.display_name, m.email, o.total, o.status,
	       o.ship_name, o.ship_phone, o.ship_address,
	       (SELECT coalesce(sum(qty), 0) FROM order_items WHERE order_id = o.id), o.created_at
	FROM orders o JOIN members m ON m.id = o.member_id`

func scanOrder(row pgx.Row) (Order, error) {
	var o Order
	err := row.Scan(&o.ID, &o.MemberID, &o.MemberName, &o.MemberEmail, &o.Total, &o.Status,
		&o.ShipName, &o.ShipPhone, &o.ShipAddress, &o.ItemCount, &o.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Order{}, ErrNotFound
	}
	return o, err
}

// CreateOrder = checkout ทำทั้งหมดใน transaction เดียว ถ้าพลาดขั้นไหน rollback ทั้งหมด
//  1. ล็อกแถวสินค้าในตะกร้า (FOR UPDATE) กันคนสั่งพร้อมกันแล้วสต็อกติดลบ
//  2. เช็กว่าเปิดขายและสต็อกพอทุกชิ้น
//  3. สร้าง orders + order_items (เก็บราคา ณ ตอนซื้อ)
//  4. ตัดสต็อก แล้วล้างตะกร้า
func (s *Store) CreateOrder(ctx context.Context, memberID int64, ship ShipInput) (Order, error) {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return Order{}, err
	}
	defer tx.Rollback(ctx) // ถ้า Commit สำเร็จแล้ว บรรทัดนี้ไม่มีผล

	rows, err := tx.Query(ctx,
		`SELECT p.id, p.name, p.price, p.stock, p.is_active, ci.qty
		 FROM cart_items ci JOIN products p ON p.id = ci.product_id
		 WHERE ci.member_id = $1
		 ORDER BY p.id
		 FOR UPDATE OF p`, memberID)
	if err != nil {
		return Order{}, err
	}
	type line struct {
		id           int64
		name         string
		price, stock int
		active       bool
		qty          int
	}
	var lines []line
	total := 0
	for rows.Next() {
		var l line
		if err := rows.Scan(&l.id, &l.name, &l.price, &l.stock, &l.active, &l.qty); err != nil {
			rows.Close()
			return Order{}, err
		}
		lines = append(lines, l)
		total += l.price * l.qty
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return Order{}, err
	}
	if len(lines) == 0 {
		return Order{}, ErrCartEmpty
	}
	for _, l := range lines {
		if !l.active || l.qty > l.stock {
			return Order{}, &StockError{Name: l.name}
		}
	}

	var orderID int64
	if err := tx.QueryRow(ctx,
		`INSERT INTO orders (member_id, total, ship_name, ship_phone, ship_address)
		 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		memberID, total, ship.ShipName, ship.ShipPhone, ship.ShipAddress).Scan(&orderID); err != nil {
		return Order{}, err
	}
	for _, l := range lines {
		if _, err := tx.Exec(ctx,
			`INSERT INTO order_items (order_id, product_id, name, unit_price, qty) VALUES ($1, $2, $3, $4, $5)`,
			orderID, l.id, l.name, l.price, l.qty); err != nil {
			return Order{}, err
		}
		if _, err := tx.Exec(ctx,
			`UPDATE products SET stock = stock - $2, updated_at = now() WHERE id = $1`, l.id, l.qty); err != nil {
			return Order{}, err
		}
	}
	if _, err := tx.Exec(ctx, `DELETE FROM cart_items WHERE member_id = $1`, memberID); err != nil {
		return Order{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return Order{}, err
	}
	return s.GetOrder(ctx, orderID, &memberID)
}

// ListOrders memberID = nil คือ admin ดูทุกคน, status ว่าง = ทุกสถานะ
func (s *Store) ListOrders(ctx context.Context, memberID *int64, status string) ([]Order, error) {
	rows, err := s.Pool.Query(ctx,
		orderSelect+` WHERE ($1::bigint IS NULL OR o.member_id = $1)
		              AND ($2 = '' OR o.status = $2)
		 ORDER BY o.created_at DESC, o.id DESC
		 LIMIT 200`, memberID, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Order{}
	for rows.Next() {
		o, err := scanOrder(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, rows.Err()
}

// GetOrder ออเดอร์พร้อมรายการสินค้า memberID != nil = ต้องเป็นออเดอร์ของคนนั้นเท่านั้น (ของคนอื่นตอบ ErrNotFound)
func (s *Store) GetOrder(ctx context.Context, id int64, memberID *int64) (Order, error) {
	o, err := scanOrder(s.Pool.QueryRow(ctx,
		orderSelect+` WHERE o.id = $1 AND ($2::bigint IS NULL OR o.member_id = $2)`, id, memberID))
	if err != nil {
		return Order{}, err
	}
	rows, err := s.Pool.Query(ctx,
		`SELECT oi.product_id, oi.name, oi.unit_price, oi.qty, p.image_url
		 FROM order_items oi JOIN products p ON p.id = oi.product_id
		 WHERE oi.order_id = $1 ORDER BY oi.name`, id)
	if err != nil {
		return Order{}, err
	}
	defer rows.Close()
	o.Items = []OrderItem{}
	for rows.Next() {
		var it OrderItem
		if err := rows.Scan(&it.ProductID, &it.Name, &it.UnitPrice, &it.Qty, &it.ImageURL); err != nil {
			return Order{}, err
		}
		o.Items = append(o.Items, it)
	}
	return o, rows.Err()
}

// SetOrderStatus เปลี่ยนสถานะตาม Transitions ถ้าเป็นการยกเลิกจะคืนสต็อกให้ด้วย (ใน transaction เดียว)
// memberID != nil = สมาชิกยกเลิกเอง: ต้องเป็นของตัวเอง และยกเลิกได้เฉพาะตอน pending
func (s *Store) SetOrderStatus(ctx context.Context, id int64, memberID *int64, to string) (Order, error) {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return Order{}, err
	}
	defer tx.Rollback(ctx)

	var from string
	err = tx.QueryRow(ctx,
		`SELECT status FROM orders WHERE id = $1 AND ($2::bigint IS NULL OR member_id = $2) FOR UPDATE`,
		id, memberID).Scan(&from)
	if errors.Is(err, pgx.ErrNoRows) {
		return Order{}, ErrNotFound
	}
	if err != nil {
		return Order{}, err
	}
	if !canMove(from, to) || (memberID != nil && (from != "pending" || to != "cancelled")) {
		return Order{}, fmt.Errorf("%w: %s -> %s", ErrBadTransition, from, to)
	}
	if to == "cancelled" {
		if _, err := tx.Exec(ctx,
			`UPDATE products p SET stock = p.stock + oi.qty, updated_at = now()
			 FROM order_items oi WHERE oi.order_id = $1 AND p.id = oi.product_id`, id); err != nil {
			return Order{}, err
		}
	}
	if _, err := tx.Exec(ctx,
		`UPDATE orders SET status = $2, updated_at = now() WHERE id = $1`, id, to); err != nil {
		return Order{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return Order{}, err
	}
	return s.GetOrder(ctx, id, memberID)
}
