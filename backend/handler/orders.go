package handler

import (
	"errors"
	"net/http"
	"strings"
	"unicode/utf8"

	"itshop/mw"
	"itshop/store"
)

// orderError แปลง error ของออเดอร์เป็นคำตอบ HTTP
func orderError(w http.ResponseWriter, err error) {
	var stockErr *store.StockError
	switch {
	case errors.Is(err, store.ErrNotFound):
		writeError(w, http.StatusNotFound, "ORDER_NOT_FOUND", "ไม่พบออเดอร์นี้")
	case errors.Is(err, store.ErrCartEmpty):
		writeError(w, http.StatusBadRequest, "CART_EMPTY", "ตะกร้าว่าง")
	case errors.As(err, &stockErr):
		writeError(w, http.StatusConflict, "OUT_OF_STOCK", stockErr.Error())
	case errors.Is(err, store.ErrBadTransition):
		writeError(w, http.StatusConflict, "BAD_STATUS", "เปลี่ยนสถานะออเดอร์แบบนี้ไม่ได้")
	default:
		internal(w, err)
	}
}

// POST /api/orders  { shipName, shipPhone, shipAddress } สร้างออเดอร์จากตะกร้า
func (h *Handler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	id, _ := mw.MemberID(r.Context())
	var in store.ShipInput
	if !readJSON(w, r, &in) {
		return
	}
	in.ShipName = strings.TrimSpace(in.ShipName)
	in.ShipPhone = strings.TrimSpace(in.ShipPhone)
	in.ShipAddress = strings.TrimSpace(in.ShipAddress)
	switch {
	case in.ShipName == "" || utf8.RuneCountInString(in.ShipName) > 50:
		writeError(w, http.StatusBadRequest, "BAD_NAME", "ต้องมีชื่อผู้รับ และยาวไม่เกิน 50 ตัวอักษร")
		return
	case len(in.ShipPhone) < 9 || len(in.ShipPhone) > 20:
		writeError(w, http.StatusBadRequest, "BAD_PHONE", "เบอร์โทรไม่ถูกต้อง")
		return
	case utf8.RuneCountInString(in.ShipAddress) < 10:
		writeError(w, http.StatusBadRequest, "BAD_ADDRESS", "กรุณากรอกที่อยู่จัดส่งให้ครบ")
		return
	}
	o, err := h.Store.CreateOrder(r.Context(), id, in)
	if err != nil {
		orderError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, o)
}

// GET /api/orders  ออเดอร์ของฉัน
func (h *Handler) MyOrders(w http.ResponseWriter, r *http.Request) {
	id, _ := mw.MemberID(r.Context())
	items, err := h.Store.ListOrders(r.Context(), &id, "")
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

// GET /api/orders/{id}  ของคนอื่นตอบ 404 (ไม่บอกว่ามีอยู่จริง)
func (h *Handler) MyOrder(w http.ResponseWriter, r *http.Request) {
	memberID, _ := mw.MemberID(r.Context())
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขออเดอร์ต้องเป็นตัวเลข")
		return
	}
	o, err := h.Store.GetOrder(r.Context(), id, &memberID)
	if err != nil {
		orderError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, o)
}

// PUT /api/orders/{id}/cancel  ยกเลิกได้เฉพาะตอน pending และคืนสต็อก
func (h *Handler) CancelMyOrder(w http.ResponseWriter, r *http.Request) {
	memberID, _ := mw.MemberID(r.Context())
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขออเดอร์ต้องเป็นตัวเลข")
		return
	}
	o, err := h.Store.SetOrderStatus(r.Context(), id, &memberID, "cancelled")
	if errors.Is(err, store.ErrBadTransition) {
		writeError(w, http.StatusConflict, "CANNOT_CANCEL", "ยกเลิกได้เฉพาะออเดอร์ที่ยังรอชำระเงิน")
		return
	}
	if err != nil {
		orderError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, o)
}
