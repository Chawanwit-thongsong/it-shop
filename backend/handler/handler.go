package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"itshop/auth"
	"itshop/store"
)

// Handler ถือของที่ทุก handler ต้องใช้: ที่เก็บข้อมูล (Store) และตัวออก/ตรวจ token
type Handler struct {
	Store   *store.Store
	Tickets *auth.Issuer
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// writeError รูปแบบ error เดียวกันทุก endpoint: {"error":{"code":"...","message":"..."}}
func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, map[string]any{
		"error": map[string]string{"code": code, "message": message},
	})
}

// internal จดรายละเอียดไว้ใน log ฝั่งเรา แต่บอกผู้ใช้แค่ว่าระบบขัดข้อง
func internal(w http.ResponseWriter, err error) {
	log.Printf("internal error: %v", err)
	writeError(w, http.StatusInternalServerError, "INTERNAL", "ระบบขัดข้อง ลองใหม่อีกครั้ง")
}

// readJSON อ่าน body เป็น struct ถ้าอ่านไม่ออกตอบ 400 ให้เลย คืน false
func readJSON(w http.ResponseWriter, r *http.Request, dst any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // กัน body ใหญ่เกิน 1 MB
	if err := json.NewDecoder(r.Body).Decode(dst); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านข้อมูล JSON ไม่ออก")
		return false
	}
	return true
}

func pathID(r *http.Request, name string) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue(name), 10, 64)
	return id, err == nil && id > 0
}

// queryInt อ่านเลขจาก query string ถ้าไม่มีหรือผิดใช้ค่า def และบีบให้อยู่ในช่วง [min, max]
func queryInt(r *http.Request, name string, def, min, max int) int {
	n, err := strconv.Atoi(r.URL.Query().Get(name))
	if err != nil {
		return def
	}
	if n < min {
		return min
	}
	if n > max {
		return max
	}
	return n
}

// trimPtr ตัดช่องว่างหัวท้าย และทำให้ข้อความว่างกลายเป็น NULL
func trimPtr(p *string) *string {
	if p == nil {
		return nil
	}
	s := strings.TrimSpace(*p)
	if s == "" {
		return nil
	}
	return &s
}
