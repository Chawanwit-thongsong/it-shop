package handler

import (
	"errors"
	"net/http"

	"itshop/mw"
	"itshop/store"
)

// ทุก handler ในไฟล์นี้ถูกครอบด้วย RequireLogin + RequireRole("admin") ใน routes.go แล้ว

// GET /api/admin/stats
func (h *Handler) AdminStats(w http.ResponseWriter, r *http.Request) {
	st, err := h.Store.Stats(r.Context())
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, st)
}

// ---------- ออเดอร์ ----------

var validStatus = map[string]bool{"pending": true, "paid": true, "shipped": true, "done": true, "cancelled": true}

// GET /api/admin/orders?status=
func (h *Handler) AdminListOrders(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	if status != "" && !validStatus[status] {
		writeError(w, http.StatusBadRequest, "BAD_STATUS", "สถานะไม่ถูกต้อง")
		return
	}
	items, err := h.Store.ListOrders(r.Context(), nil, status)
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "transitions": store.Transitions})
}

// GET /api/admin/orders/{id}
func (h *Handler) AdminGetOrder(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขออเดอร์ต้องเป็นตัวเลข")
		return
	}
	o, err := h.Store.GetOrder(r.Context(), id, nil)
	if err != nil {
		orderError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, o)
}

type statusReq struct {
	Status string `json:"status"`
}

// PUT /api/admin/orders/{id}/status  { status } เปลี่ยนได้ตาม store.Transitions เท่านั้น
func (h *Handler) AdminSetOrderStatus(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขออเดอร์ต้องเป็นตัวเลข")
		return
	}
	var req statusReq
	if !readJSON(w, r, &req) {
		return
	}
	if !validStatus[req.Status] {
		writeError(w, http.StatusBadRequest, "BAD_STATUS", "สถานะไม่ถูกต้อง")
		return
	}
	o, err := h.Store.SetOrderStatus(r.Context(), id, nil, req.Status)
	if err != nil {
		orderError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, o)
}

// ---------- สมาชิก ----------

// GET /api/admin/members
func (h *Handler) AdminMembers(w http.ResponseWriter, r *http.Request) {
	items, err := h.Store.ListMembers(r.Context())
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

type roleReq struct {
	Role string `json:"role"`
}

// PUT /api/admin/members/{id}/role  ห้ามเปลี่ยนของตัวเอง (กัน admin คนสุดท้ายลดสิทธิ์ตัวเองจนไม่มีใครเข้าหลังบ้านได้)
func (h *Handler) AdminSetRole(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขสมาชิกต้องเป็นตัวเลข")
		return
	}
	var req roleReq
	if !readJSON(w, r, &req) {
		return
	}
	if req.Role != "member" && req.Role != "admin" {
		writeError(w, http.StatusBadRequest, "BAD_ROLE", "role ต้องเป็น member หรือ admin")
		return
	}
	if me, _ := mw.MemberID(r.Context()); me == id {
		writeError(w, http.StatusBadRequest, "SELF_ROLE", "เปลี่ยนบทบาทของตัวเองไม่ได้")
		return
	}
	m, err := h.Store.UpdateMemberRole(r.Context(), id, req.Role)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "MEMBER_NOT_FOUND", "ไม่พบสมาชิกคนนี้")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, m)
}
