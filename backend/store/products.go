package store

import (
	"context"
	"errors"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

var ErrBadCategory = errors.New("bad category")

type Category struct {
	ID   int    `json:"id"`
	Slug string `json:"slug"`
	Name string `json:"name"`
}

type Product struct {
	ID           int64   `json:"id"`
	CategoryID   int     `json:"categoryId"`
	CategorySlug string  `json:"categorySlug"`
	CategoryName string  `json:"categoryName"`
	Name         string  `json:"name"`
	Brand        *string `json:"brand"`
	Description  *string `json:"description"`
	Price        int     `json:"price"`
	Stock        int     `json:"stock"`
	ImageURL     *string `json:"imageUrl"`
	IsActive     bool    `json:"isActive"`
}

// ProductInput ช่องที่ admin กรอกในฟอร์มเพิ่ม/แก้สินค้า
type ProductInput struct {
	CategoryID  int     `json:"categoryId"`
	Name        string  `json:"name"`
	Brand       *string `json:"brand"`
	Description *string `json:"description"`
	Price       int     `json:"price"`
	Stock       int     `json:"stock"`
	ImageURL    *string `json:"imageUrl"`
	IsActive    bool    `json:"isActive"`
}

// ProductFilter เงื่อนไขค้นหา ทุกค่าจากผู้ใช้ส่งผ่าน $n เสมอ ไม่ต่อสตริงเข้า SQL ตรงๆ
type ProductFilter struct {
	Q               string
	Category        string // slug
	Page, Limit     int
	IncludeInactive bool // true เฉพาะหน้า admin
}

const productSelect = `SELECT p.id, p.category_id, c.slug, c.name, p.name, p.brand, p.description,
	       p.price, p.stock, p.image_url, p.is_active
	FROM products p JOIN categories c ON c.id = p.category_id`

func scanProduct(row pgx.Row) (Product, error) {
	var p Product
	err := row.Scan(&p.ID, &p.CategoryID, &p.CategorySlug, &p.CategoryName, &p.Name, &p.Brand,
		&p.Description, &p.Price, &p.Stock, &p.ImageURL, &p.IsActive)
	if errors.Is(err, pgx.ErrNoRows) {
		return Product{}, ErrNotFound
	}
	return p, err
}

func (s *Store) ListCategories(ctx context.Context) ([]Category, error) {
	rows, err := s.Pool.Query(ctx, `SELECT id, slug, name FROM categories ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Category{}
	for rows.Next() {
		var c Category
		if err := rows.Scan(&c.ID, &c.Slug, &c.Name); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

// ListProducts คืนสินค้าหน้าที่ขอ และจำนวนทั้งหมดที่ตรงเงื่อนไข (ไว้ทำปุ่มเปลี่ยนหน้า)
func (s *Store) ListProducts(ctx context.Context, f ProductFilter) ([]Product, int, error) {
	where := " WHERE 1=1"
	args := []any{} // ค่าลำดับที่ n ใน args คือ $n ใน SQL
	if !f.IncludeInactive {
		where += " AND p.is_active"
	}
	if f.Q != "" {
		args = append(args, "%"+f.Q+"%")
		n := strconv.Itoa(len(args))
		where += " AND (p.name ILIKE $" + n + " OR p.brand ILIKE $" + n + ")"
	}
	if f.Category != "" {
		args = append(args, f.Category)
		where += " AND c.slug = $" + strconv.Itoa(len(args))
	}

	var total int
	if err := s.Pool.QueryRow(ctx,
		`SELECT count(*) FROM products p JOIN categories c ON c.id = p.category_id`+where, args...).
		Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, f.Limit, (f.Page-1)*f.Limit)
	n := len(args)
	rows, err := s.Pool.Query(ctx,
		productSelect+where+" ORDER BY p.id DESC LIMIT $"+strconv.Itoa(n-1)+" OFFSET $"+strconv.Itoa(n), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := []Product{}
	for rows.Next() {
		p, err := scanProduct(rows)
		if err != nil {
			return nil, 0, err
		}
		out = append(out, p)
	}
	return out, total, rows.Err()
}

// GetProduct หน้าร้านเห็นเฉพาะสินค้าที่เปิดขาย ส่วน admin เห็นทุกชิ้น
func (s *Store) GetProduct(ctx context.Context, id int64, includeInactive bool) (Product, error) {
	return scanProduct(s.Pool.QueryRow(ctx,
		productSelect+` WHERE p.id = $1 AND (p.is_active OR $2)`, id, includeInactive))
}

func badCategory(err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23503" { // foreign_key_violation
		return ErrBadCategory
	}
	return err
}

func (s *Store) CreateProduct(ctx context.Context, in ProductInput) (Product, error) {
	var id int64
	err := s.Pool.QueryRow(ctx,
		`INSERT INTO products (category_id, name, brand, description, price, stock, image_url, is_active)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
		in.CategoryID, in.Name, in.Brand, in.Description, in.Price, in.Stock, in.ImageURL, in.IsActive).Scan(&id)
	if err != nil {
		return Product{}, badCategory(err)
	}
	return s.GetProduct(ctx, id, true)
}

func (s *Store) UpdateProduct(ctx context.Context, id int64, in ProductInput) (Product, error) {
	tag, err := s.Pool.Exec(ctx,
		`UPDATE products SET category_id = $2, name = $3, brand = $4, description = $5,
		        price = $6, stock = $7, image_url = $8, is_active = $9, updated_at = now()
		 WHERE id = $1`,
		id, in.CategoryID, in.Name, in.Brand, in.Description, in.Price, in.Stock, in.ImageURL, in.IsActive)
	if err != nil {
		return Product{}, badCategory(err)
	}
	if tag.RowsAffected() == 0 {
		return Product{}, ErrNotFound
	}
	return s.GetProduct(ctx, id, true)
}

// DeactivateProduct = ลบแบบ soft delete ซ่อนจากหน้าร้าน แต่ออเดอร์เก่ายังอ้างถึงได้
func (s *Store) DeactivateProduct(ctx context.Context, id int64) error {
	tag, err := s.Pool.Exec(ctx,
		`UPDATE products SET is_active = false, updated_at = now() WHERE id = $1`, id)
	if err == nil && tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return err
}
