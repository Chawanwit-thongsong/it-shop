package handler

import (
	"errors"
	"net/http"
	"strings"

	"itshop/store"
)

// GET /api/categories
func (h *Handler) Categories(w http.ResponseWriter, r *http.Request) {
	items, err := h.Store.ListCategories(r.Context())
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

// listProducts ใช้ร่วมกันระหว่างหน้าร้าน (เห็นแค่ที่เปิดขาย) กับหน้า admin (เห็นทั้งหมด)
func (h *Handler) listProducts(w http.ResponseWriter, r *http.Request, includeInactive bool) {
	f := store.ProductFilter{
		Q:               strings.TrimSpace(r.URL.Query().Get("q")),
		Category:        r.URL.Query().Get("category"),
		Page:            queryInt(r, "page", 1, 1, 1000),
		Limit:           queryInt(r, "limit", 12, 1, 100),
		IncludeInactive: includeInactive,
	}
	items, total, err := h.Store.ListProducts(r.Context(), f)
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"items": items, "total": total, "page": f.Page, "limit": f.Limit,
	})
}

// GET /api/products?q=&category=&page=&limit=
func (h *Handler) ListProducts(w http.ResponseWriter, r *http.Request) {
	h.listProducts(w, r, false)
}

// GET /api/products/{id}
func (h *Handler) GetProduct(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "รหัสสินค้าต้องเป็นตัวเลข")
		return
	}
	p, err := h.Store.GetProduct(r.Context(), id, false)
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
