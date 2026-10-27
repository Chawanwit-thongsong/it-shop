package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/joho/godotenv/autoload" // โหลด .env ให้เองถ้ามีไฟล์ (ในเครื่อง) บน Render ไม่มีไฟล์ก็ข้ามไป

	"itshop/auth"
	"itshop/handler"
	"itshop/mw"
	"itshop/store"
)

func main() {
	// ค่าตั้งทั้งหมดมาจาก environment (.env ในเครื่อง / Environment ของ Render) ไม่ hardcode ในโค้ด
	secret := os.Getenv("JWT_SECRET")
	if len(secret) < 32 {
		log.Fatal("JWT_SECRET ต้องยาวอย่างน้อย 32 ตัวอักษร")
	}
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatal("ต่อฐานข้อมูลไม่ติด ", err)
	}

	tickets := &auth.Issuer{Secret: []byte(secret), TTL: 24 * time.Hour}
	h := &handler.Handler{Store: &store.Store{Pool: pool}, Tickets: tickets}

	origins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
	port := os.Getenv("PORT") // Render ตั้งให้เอง
	if port == "" {
		port = "8080"
	}
	log.Println("IT Shop API ฟังอยู่ที่ :"+port, "อนุญาต origin", origins)
	log.Fatal(http.ListenAndServe(":"+port, mw.Logging(mw.CORS(origins, routes(h, tickets)))))
}
