package handler

import (
	"errors"
	"net/http"

	"itshop/mw"
	"itshop/store"
)

// ทุกเส้นในไฟล์นี้ผ่าน RequireLogin แล้ว และใช้ member_id จาก token เสมอ (คนอื่นแตะตะกร้าเราไม่ได้)

type cartReq struct {
	ProductID int64 `json:"productId"`
	Qty       int   `json:"qty"`
}

// cartError แปลง error จาก store เป็นคำตอบที่ผู้ใช้เข้าใจ
func cartError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, store.ErrNotFound):
		writeError(w, http.StatusNotFound, "NOT_FOUND", "ไม่พบสินค้านี้")
	case errors.Is(err, store.ErrInactive):
		writeError(w, http.StatusConflict, "NOT_FOR_SALE", "สินค้านี้ปิดการขายแล้ว")
	case errors.Is(err, store.ErrOutOfStock):
		writeError(w, http.StatusConflict, "OUT_OF_STOCK", "จำนวนเกินสต็อกที่มี")
	default:
		internal(w, err)
	}
}

func (h *Handler) sendCart(w http.ResponseWriter, r *http.Request, memberID int64) {
	cart, err := h.Store.GetCart(r.Context(), memberID)
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, cart)
}

// GET /api/cart  ตอบ { items, total }
func (h *Handler) GetCart(w http.ResponseWriter, r *http.Request) {
	id, _ := mw.MemberID(r.Context())
	h.sendCart(w, r, id)
}

// POST /api/cart  { productId, qty } เพิ่มลงตะกร้า (มีอยู่แล้วบวกเพิ่ม)
func (h *Handler) AddToCart(w http.ResponseWriter, r *http.Request) {
	id, _ := mw.MemberID(r.Context())
	var req cartReq
	if !readJSON(w, r, &req) {
		return
	}
	if req.Qty == 0 {
		req.Qty = 1
	}
	if req.ProductID <= 0 || req.Qty < 1 || req.Qty > 99 {
		writeError(w, http.StatusBadRequest, "BAD_QTY", "จำนวนต้องอยู่ระหว่าง 1-99")
		return
	}
	if err := h.Store.AddToCart(r.Context(), id, req.ProductID, req.Qty); err != nil {
		cartError(w, err)
		return
	}
	h.sendCart(w, r, id)
}

// PUT /api/cart/{productId}  { qty } ตั้งจำนวนใหม่
func (h *Handler) SetCartQty(w http.ResponseWriter, r *http.Request) {
	id, _ := mw.MemberID(r.Context())
	productID, ok := pathID(r, "productId")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "รหัสสินค้าต้องเป็นตัวเลข")
		return
	}
	var req cartReq
	if !readJSON(w, r, &req) {
		return
	}
	if req.Qty < 1 || req.Qty > 99 {
		writeError(w, http.StatusBadRequest, "BAD_QTY", "จำนวนต้องอยู่ระหว่าง 1-99")
		return
	}
	if err := h.Store.SetCartQty(r.Context(), id, productID, req.Qty); err != nil {
		cartError(w, err)
		return
	}
	h.sendCart(w, r, id)
}

// DELETE /api/cart/{productId}
func (h *Handler) RemoveFromCart(w http.ResponseWriter, r *http.Request) {
	id, _ := mw.MemberID(r.Context())
	productID, ok := pathID(r, "productId")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "รหัสสินค้าต้องเป็นตัวเลข")
		return
	}
	if err := h.Store.RemoveFromCart(r.Context(), id, productID); err != nil {
		cartError(w, err)
		return
	}
	h.sendCart(w, r, id)
}
