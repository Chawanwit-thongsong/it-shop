package store

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
)

var (
	ErrOutOfStock = errors.New("out of stock")
	ErrInactive   = errors.New("product not for sale")
)

type CartItem struct {
	ProductID int64   `json:"productId"`
	Name      string  `json:"name"`
	Price     int     `json:"price"`
	Stock     int     `json:"stock"`
	ImageURL  *string `json:"imageUrl"`
	IsActive  bool    `json:"isActive"`
	Qty       int     `json:"qty"`
	Subtotal  int     `json:"subtotal"`
}

type Cart struct {
	Items []CartItem `json:"items"`
	Total int        `json:"total"`
}

// GetCart ตะกร้าของสมาชิกคนนี้ ราคาเป็นราคาปัจจุบันของสินค้า (ราคาจริงล็อกตอน checkout)
func (s *Store) GetCart(ctx context.Context, memberID int64) (Cart, error) {
	rows, err := s.Pool.Query(ctx,
		`SELECT p.id, p.name, p.price, p.stock, p.image_url, p.is_active, ci.qty
		 FROM cart_items ci JOIN products p ON p.id = ci.product_id
		 WHERE ci.member_id = $1
		 ORDER BY p.name`, memberID)
	if err != nil {
		return Cart{}, err
	}
	defer rows.Close()
	cart := Cart{Items: []CartItem{}}
	for rows.Next() {
		var it CartItem
		if err := rows.Scan(&it.ProductID, &it.Name, &it.Price, &it.Stock, &it.ImageURL, &it.IsActive, &it.Qty); err != nil {
			return Cart{}, err
		}
		it.Subtotal = it.Price * it.Qty
		cart.Total += it.Subtotal
		cart.Items = append(cart.Items, it)
	}
	return cart, rows.Err()
}

// checkProduct สินค้าต้องมีอยู่ เปิดขาย และสต็อกพอสำหรับ qty
func (s *Store) checkProduct(ctx context.Context, productID int64, qty int) error {
	var stock int
	var active bool
	err := s.Pool.QueryRow(ctx, `SELECT stock, is_active FROM products WHERE id = $1`, productID).Scan(&stock, &active)
	switch {
	case errors.Is(err, pgx.ErrNoRows):
		return ErrNotFound
	case err != nil:
		return err
	case !active:
		return ErrInactive
	case qty > stock:
		return ErrOutOfStock
	}
	return nil
}

// AddToCart เพิ่มจำนวน ถ้ามีในตะกร้าแล้วบวกเพิ่ม (รวมแล้วต้องไม่เกินสต็อก)
func (s *Store) AddToCart(ctx context.Context, memberID, productID int64, qty int) error {
	var current int
	err := s.Pool.QueryRow(ctx,
		`SELECT qty FROM cart_items WHERE member_id = $1 AND product_id = $2`, memberID, productID).Scan(&current)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return err
	}
	if err := s.checkProduct(ctx, productID, current+qty); err != nil {
		return err
	}
	_, err = s.Pool.Exec(ctx,
		`INSERT INTO cart_items (member_id, product_id, qty) VALUES ($1, $2, $3)
		 ON CONFLICT (member_id, product_id) DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty`,
		memberID, productID, qty)
	return err
}

// SetCartQty ตั้งจำนวนใหม่ของสินค้าที่อยู่ในตะกร้าแล้ว
func (s *Store) SetCartQty(ctx context.Context, memberID, productID int64, qty int) error {
	if err := s.checkProduct(ctx, productID, qty); err != nil {
		return err
	}
	tag, err := s.Pool.Exec(ctx,
		`UPDATE cart_items SET qty = $3 WHERE member_id = $1 AND product_id = $2`, memberID, productID, qty)
	if err == nil && tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return err
}

func (s *Store) RemoveFromCart(ctx context.Context, memberID, productID int64) error {
	tag, err := s.Pool.Exec(ctx,
		`DELETE FROM cart_items WHERE member_id = $1 AND product_id = $2`, memberID, productID)
	if err == nil && tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return err
}
