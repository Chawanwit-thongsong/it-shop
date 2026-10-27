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
	mux.HandleFunc("GET /api/cart", login(h.GetCart))
	mux.HandleFunc("POST /api/cart", login(h.AddToCart))
	mux.HandleFunc("PUT /api/cart/{productId}", login(h.SetCartQty))
	mux.HandleFunc("DELETE /api/cart/{productId}", login(h.RemoveFromCart))
	mux.HandleFunc("POST /api/orders", login(h.CreateOrder))
	mux.HandleFunc("GET /api/orders", login(h.MyOrders))
	mux.HandleFunc("GET /api/orders/{id}", login(h.MyOrder))
	mux.HandleFunc("PUT /api/orders/{id}/cancel", login(h.CancelMyOrder))

	// ---------- Admin: ทุกเส้นใต้ /api/admin ผ่าน admin(...) ไม่มีข้อยกเว้น ----------
	mux.HandleFunc("GET /api/admin/stats", admin(h.AdminStats))
	mux.HandleFunc("GET /api/admin/products", admin(h.AdminListProducts))
	mux.HandleFunc("GET /api/admin/products/{id}", admin(h.AdminGetProduct))
	mux.HandleFunc("POST /api/admin/products", admin(h.AdminCreateProduct))
	mux.HandleFunc("PUT /api/admin/products/{id}", admin(h.AdminUpdateProduct))
	mux.HandleFunc("DELETE /api/admin/products/{id}", admin(h.AdminDeleteProduct))
	mux.HandleFunc("GET /api/admin/orders", admin(h.AdminListOrders))
	mux.HandleFunc("GET /api/admin/orders/{id}", admin(h.AdminGetOrder))
	mux.HandleFunc("PUT /api/admin/orders/{id}/status", admin(h.AdminSetOrderStatus))
	mux.HandleFunc("GET /api/admin/members", admin(h.AdminMembers))
	mux.HandleFunc("PUT /api/admin/members/{id}/role", admin(h.AdminSetRole))

	return mux
}
