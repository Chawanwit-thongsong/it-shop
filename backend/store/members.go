package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

var ErrEmailTaken = errors.New("email taken")

type Member struct {
	ID           int64      `json:"id"`
	Email        string     `json:"email"`
	DisplayName  string     `json:"displayName"`
	Phone        *string    `json:"phone"`
	Address      *string    `json:"address"`
	Role         string     `json:"role"`
	CreatedAt    *time.Time `json:"createdAt,omitempty"`
	PasswordHash string     `json:"-"` // ไม่มีวันออกไปกับ JSON
}

// ProfileInput ช่องที่สมาชิกแก้เองได้ (email กับ role แก้ไม่ได้)
type ProfileInput struct {
	DisplayName string  `json:"displayName"`
	Phone       *string `json:"phone"`
	Address     *string `json:"address"`
}

const memberCols = `id, email, display_name, phone, address, role, created_at`

func scanMember(row pgx.Row) (Member, error) {
	var m Member
	err := row.Scan(&m.ID, &m.Email, &m.DisplayName, &m.Phone, &m.Address, &m.Role, &m.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Member{}, ErrNotFound
	}
	return m, err
}

func (s *Store) CreateMember(ctx context.Context, email, hash, name string) (Member, error) {
	m, err := scanMember(s.Pool.QueryRow(ctx,
		`INSERT INTO members (email, password_hash, display_name)
		 VALUES ($1, $2, $3)
		 RETURNING `+memberCols, email, hash, name))
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" { // unique_violation
		return Member{}, ErrEmailTaken
	}
	return m, err
}

// MemberByEmail ใช้ตอน login จึงดึง password_hash มาด้วย
func (s *Store) MemberByEmail(ctx context.Context, email string) (Member, error) {
	var m Member
	err := s.Pool.QueryRow(ctx,
		`SELECT `+memberCols+`, password_hash FROM members WHERE lower(email) = $1`, email).
		Scan(&m.ID, &m.Email, &m.DisplayName, &m.Phone, &m.Address, &m.Role, &m.CreatedAt, &m.PasswordHash)
	if errors.Is(err, pgx.ErrNoRows) {
		return Member{}, ErrNotFound
	}
	return m, err
}

// MemberByID ใช้กับ /api/me เลขสมาชิกมาจาก token ที่ตรวจแล้ว
func (s *Store) MemberByID(ctx context.Context, id int64) (Member, error) {
	return scanMember(s.Pool.QueryRow(ctx, `SELECT `+memberCols+` FROM members WHERE id = $1`, id))
}

func (s *Store) UpdateProfile(ctx context.Context, id int64, in ProfileInput) (Member, error) {
	return scanMember(s.Pool.QueryRow(ctx,
		`UPDATE members SET display_name = $2, phone = $3, address = $4, updated_at = now()
		 WHERE id = $1
		 RETURNING `+memberCols, id, in.DisplayName, in.Phone, in.Address))
}

func (s *Store) PasswordHash(ctx context.Context, id int64) (string, error) {
	var hash string
	err := s.Pool.QueryRow(ctx, `SELECT password_hash FROM members WHERE id = $1`, id).Scan(&hash)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrNotFound
	}
	return hash, err
}

func (s *Store) UpdatePassword(ctx context.Context, id int64, hash string) error {
	tag, err := s.Pool.Exec(ctx,
		`UPDATE members SET password_hash = $2, updated_at = now() WHERE id = $1`, id, hash)
	if err == nil && tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return err
}
