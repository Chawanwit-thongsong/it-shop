package handler

import (
	"errors"
	"net/http"
	"strings"
	"unicode/utf8"

	"itshop/auth"
	"itshop/mw"
	"itshop/store"
)

type registerReq struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	DisplayName string `json:"displayName"`
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type passwordReq struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

// validPassword bcrypt รับได้ไม่เกิน 72 ไบต์
func validPassword(p string) bool {
	return utf8.RuneCountInString(p) >= 8 && len(p) <= 72
}

func validName(name string) bool {
	return name != "" && utf8.RuneCountInString(name) <= 50
}

// POST /api/auth/register
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerReq
	if !readJSON(w, r, &req) {
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))
	name := strings.TrimSpace(req.DisplayName)
	switch {
	case !strings.Contains(email, "@") || len(email) > 255:
		writeError(w, http.StatusBadRequest, "BAD_EMAIL", "รูปแบบอีเมลไม่ถูกต้อง")
		return
	case !validPassword(req.Password):
		writeError(w, http.StatusBadRequest, "BAD_PASSWORD", "รหัสผ่านต้องยาว 8 ตัวอักษรขึ้นไป")
		return
	case !validName(name):
		writeError(w, http.StatusBadRequest, "BAD_NAME", "ต้องมีชื่อ และยาวไม่เกิน 50 ตัวอักษร")
		return
	}
	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		internal(w, err)
		return
	}
	m, err := h.Store.CreateMember(r.Context(), email, hash, name)
	if errors.Is(err, store.ErrEmailTaken) {
		writeError(w, http.StatusConflict, "EMAIL_TAKEN", "อีเมลนี้มีบัญชีอยู่แล้ว")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, m)
}

// POST /api/auth/login  ตอบ { token, member }
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginReq
	if !readJSON(w, r, &req) {
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))
	m, err := h.Store.MemberByEmail(r.Context(), email)
	if err != nil && !errors.Is(err, store.ErrNotFound) {
		internal(w, err)
		return
	}
	// ไม่บอกว่าผิดที่อีเมลหรือรหัส กันคนไล่เดาว่าอีเมลไหนมีบัญชี
	if errors.Is(err, store.ErrNotFound) || !auth.CheckPassword(m.PasswordHash, req.Password) {
		writeError(w, http.StatusUnauthorized, "BAD_CREDENTIALS", "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
		return
	}
	token, err := h.Tickets.Issue(m.ID, m.Role)
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": token, "member": m})
}

// GET /api/me  เลขสมาชิกมาจาก token เท่านั้น ไม่รับจาก URL หรือ body
func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	id, _ := mw.MemberID(r.Context())
	m, err := h.Store.MemberByID(r.Context(), id)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusUnauthorized, "MEMBER_GONE", "ไม่พบบัญชีนี้แล้ว กรุณาเข้าสู่ระบบใหม่")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, m)
}

// PUT /api/me  แก้ชื่อ เบอร์ ที่อยู่
func (h *Handler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	id, _ := mw.MemberID(r.Context())
	var in store.ProfileInput
	if !readJSON(w, r, &in) {
		return
	}
	in.DisplayName = strings.TrimSpace(in.DisplayName)
	in.Phone = trimPtr(in.Phone)
	in.Address = trimPtr(in.Address)
	if !validName(in.DisplayName) {
		writeError(w, http.StatusBadRequest, "BAD_NAME", "ต้องมีชื่อ และยาวไม่เกิน 50 ตัวอักษร")
		return
	}
	if in.Phone != nil && len(*in.Phone) > 20 {
		writeError(w, http.StatusBadRequest, "BAD_PHONE", "เบอร์โทรยาวเกินไป")
		return
	}
	m, err := h.Store.UpdateProfile(r.Context(), id, in)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusUnauthorized, "MEMBER_GONE", "ไม่พบบัญชีนี้แล้ว กรุณาเข้าสู่ระบบใหม่")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, m)
}

// PUT /api/me/password  ต้องยืนยันรหัสเดิมก่อน กันคนแอบใช้เครื่องที่ login ค้างไว้
func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	id, _ := mw.MemberID(r.Context())
	var req passwordReq
	if !readJSON(w, r, &req) {
		return
	}
	if !validPassword(req.NewPassword) {
		writeError(w, http.StatusBadRequest, "BAD_PASSWORD", "รหัสผ่านใหม่ต้องยาว 8 ตัวอักษรขึ้นไป")
		return
	}
	hash, err := h.Store.PasswordHash(r.Context(), id)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusUnauthorized, "MEMBER_GONE", "ไม่พบบัญชีนี้แล้ว กรุณาเข้าสู่ระบบใหม่")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	if !auth.CheckPassword(hash, req.CurrentPassword) {
		writeError(w, http.StatusBadRequest, "WRONG_PASSWORD", "รหัสผ่านเดิมไม่ถูกต้อง")
		return
	}
	newHash, err := auth.HashPassword(req.NewPassword)
	if err != nil {
		internal(w, err)
		return
	}
	if err := h.Store.UpdatePassword(r.Context(), id, newHash); err != nil {
		internal(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
