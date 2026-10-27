package handler

import (
	"errors"
	"net/http"
	"strings"
	"unicode/utf8"

	"itshop/store"
)

// ทุก handler ในไฟล์นี้ถูกครอบด้วย RequireLogin + RequireRole("admin") ใน routes.go แล้ว

// validateProduct ตรวจฝั่ง server ซ้ำอีกชั้น แม้ฟอร์ม React จะเช็กแล้ว เพราะคนยิง API ตรงๆ ได้
func validateProduct(in *store.ProductInput) (code, message string) {
	in.Name = strings.TrimSpace(in.Name)
	in.Brand = trimPtr(in.Brand)
	in.Description = trimPtr(in.Description)
	in.ImageURL = trimPtr(in.ImageURL)
	switch {
	case in.Name == "" || utf8.RuneCountInString(in.Name) > 255:
		return "BAD_NAME", "ต้องมีชื่อสินค้า และยาวไม่เกิน 255 ตัวอักษร"
	case in.CategoryID <= 0:
		return "BAD_CATEGORY", "ต้องเลือกหมวดสินค้า"
	case in.Price < 0 || in.Price > 10_000_000:
		return "BAD_PRICE", "ราคาต้องอยู่ระหว่าง 0 ถึง 10,000,000 บาท"
	case in.Stock < 0:
		return "BAD_STOCK", "จำนวนสต็อกติดลบไม่ได้"
	case in.ImageURL != nil && !strings.HasPrefix(*in.ImageURL, "https://"):
		return "BAD_IMAGE", "ลิงก์รูปต้องขึ้นต้นด้วย https://"
	}
	return "", ""
}

// GET /api/admin/products  เหมือนหน้าร้าน แต่เห็นสินค้าที่ปิดขายด้วย
func (h *Handler) AdminListProducts(w http.ResponseWriter, r *http.Request) {
	h.listProducts(w, r, true)
}

// GET /api/admin/products/{id}
func (h *Handler) AdminGetProduct(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "รหัสสินค้าต้องเป็นตัวเลข")
		return
	}
	p, err := h.Store.GetProduct(r.Context(), id, true)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "PRODUCT_NOT_FOUND", "ไม่พบสินค้านี้")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, p)
}

// POST /api/admin/products
func (h *Handler) AdminCreateProduct(w http.ResponseWriter, r *http.Request) {
	var in store.ProductInput
	if !readJSON(w, r, &in) {
		return
	}
	if code, msg := validateProduct(&in); code != "" {
		writeError(w, http.StatusBadRequest, code, msg)
		return
	}
	p, err := h.Store.CreateProduct(r.Context(), in)
	if errors.Is(err, store.ErrBadCategory) {
		writeError(w, http.StatusBadRequest, "BAD_CATEGORY", "ไม่มีหมวดสินค้านี้")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, p)
}

// PUT /api/admin/products/{id}
func (h *Handler) AdminUpdateProduct(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "รหัสสินค้าต้องเป็นตัวเลข")
		return
	}
	var in store.ProductInput
	if !readJSON(w, r, &in) {
		return
	}
	if code, msg := validateProduct(&in); code != "" {
		writeError(w, http.StatusBadRequest, code, msg)
		return
	}
	p, err := h.Store.UpdateProduct(r.Context(), id, in)
	switch {
	case errors.Is(err, store.ErrNotFound):
		writeError(w, http.StatusNotFound, "PRODUCT_NOT_FOUND", "ไม่พบสินค้านี้")
	case errors.Is(err, store.ErrBadCategory):
		writeError(w, http.StatusBadRequest, "BAD_CATEGORY", "ไม่มีหมวดสินค้านี้")
	case err != nil:
		internal(w, err)
	default:
		writeJSON(w, http.StatusOK, p)
	}
}

// DELETE /api/admin/products/{id}  ปิดการขาย (soft delete) ตอบ 204
func (h *Handler) AdminDeleteProduct(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "รหัสสินค้าต้องเป็นตัวเลข")
		return
	}
	err := h.Store.DeactivateProduct(r.Context(), id)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "PRODUCT_NOT_FOUND", "ไม่พบสินค้านี้")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
