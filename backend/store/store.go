package store

import (
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrNotFound ใช้ร่วมกันทุกตาราง handler แปลงเป็น 404
var ErrNotFound = errors.New("not found")

// Store รวมคำสั่ง SQL ทั้งหมดของแอป (handler ไม่เขียน SQL เอง)
type Store struct {
	Pool *pgxpool.Pool
}
