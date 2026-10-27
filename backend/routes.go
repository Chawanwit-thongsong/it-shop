package main

import (
	"net/http"

	"itshop/auth"
	"itshop/handler"
	"itshop/mw"
)

// routes รวมเส้นทาง API ทั้งหมดไว้ที่เดียว ดูไฟล์นี้ไฟล์เดียวก็รู้ว่าเส้นไหนใครเข้าได้
func routes(h *handler.Handler, tickets *auth.Issuer) *http.ServeMux {
	// login = ต้องมี token, admin = ต้องมี token และ role เป็น admin (ตรวจ token ก่อนเสมอ ค่อยดู role)
	login := func(next http.HandlerFunc) http.HandlerFunc { return mw.RequireLogin(tickets, next) }
	admin := func(next http.HandlerFunc) http.HandlerFunc { return login(mw.RequireRole("admin", next)) }

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"ok":true}`))
	})

	// ---------- Guest: ไม่ต้อง login ----------
	mux.HandleFunc("POST /api/auth/register", h.Register)
	mux.HandleFunc("POST /api/auth/login", h.Login)
	mux.HandleFunc("GET /api/categories", h.Categories)
	mux.HandleFunc("GET /api/products", h.ListProducts)
	mux.HandleFunc("GET /api/products/{id}", h.GetProduct)

	// ---------- Member: ต้อง login ----------
	mux.HandleFunc("GET /api/me", login(h.Me))
	mux.HandleFunc("PUT /api/me", login(h.UpdateMe))
	mux.HandleFunc("PUT /api/me/password", login(h.ChangePassword))
	// TODO รอบถัดไป: /api/cart, /api/orders

	// ---------- Admin: ทุกเส้นใต้ /api/admin ผ่าน admin(...) ไม่มีข้อยกเว้น ----------
	mux.HandleFunc("GET /api/admin/products", admin(h.AdminListProducts))
	mux.HandleFunc("GET /api/admin/products/{id}", admin(h.AdminGetProduct))
	mux.HandleFunc("POST /api/admin/products", admin(h.AdminCreateProduct))
	mux.HandleFunc("PUT /api/admin/products/{id}", admin(h.AdminUpdateProduct))
	mux.HandleFunc("DELETE /api/admin/products/{id}", admin(h.AdminDeleteProduct))
	// TODO รอบถัดไป: /api/admin/stats, /api/admin/orders, /api/admin/members

	return mux
}
