// seedgen ดึงสินค้าสาย IT จาก DummyJSON แล้วเขียนเป็น db/seed.sql
// รันครั้งเดียวตอนเตรียมข้อมูล (หน้าเว็บไม่ได้ยิง DummyJSON เอง):
//
//	go run ./cmd/seedgen > db/seed.sql
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
)

type category struct {
	Slug string
	Name string
}

// หมวดที่ดึงมา (slug ตรงกับของ DummyJSON) พร้อมชื่อไทย
var categories = []category{
	{"laptops", "โน้ตบุ๊ก"},
	{"smartphones", "สมาร์ตโฟน"},
	{"tablets", "แท็บเล็ต"},
	{"mobile-accessories", "อุปกรณ์เสริม"},
}

type product struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Brand       string  `json:"brand"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	Thumbnail   string  `json:"thumbnail"`
}

const usdToTHB = 35

// q ครอบข้อความเป็น SQL string และ escape ' เป็น ”
func q(s string) string {
	if s == "" {
		return "NULL"
	}
	return "'" + strings.ReplaceAll(s, "'", "''") + "'"
}

// baht แปลงราคา USD เป็นบาท แล้วปัดให้ลงท้ายด้วย 90 แบบราคาร้านค้า
func baht(usd float64) int {
	p := int(usd*usdToTHB/100+0.5)*100 - 10
	if p < 90 {
		p = 90
	}
	return p
}

func main() {
	out := os.Stdout
	fmt.Fprintln(out, "-- สร้างโดย cmd/seedgen จาก https://dummyjson.com (ราคา USD x 35 ปัดเป็นบาท)")
	fmt.Fprintln(out, "BEGIN;")
	fmt.Fprintln(out, "TRUNCATE order_items, orders, cart_items, products, categories RESTART IDENTITY CASCADE;")
	fmt.Fprintln(out)

	for _, c := range categories {
		fmt.Fprintf(out, "INSERT INTO categories (slug, name) VALUES (%s, %s);\n", q(c.Slug), q(c.Name))
	}
	fmt.Fprintln(out)

	total := 0
	for _, c := range categories {
		res, err := http.Get("https://dummyjson.com/products/category/" + c.Slug + "?limit=0")
		if err != nil {
			log.Fatal(err)
		}
		var body struct {
			Products []product `json:"products"`
		}
		if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
			log.Fatal(err)
		}
		res.Body.Close()

		for _, p := range body.Products {
			fmt.Fprintf(out,
				"INSERT INTO products (category_id, name, brand, description, price, stock, image_url)\n"+
					"  SELECT id, %s, %s, %s, %d, %d, %s FROM categories WHERE slug = %s;\n",
				q(p.Title), q(p.Brand), q(p.Description), baht(p.Price), p.Stock, q(p.Thumbnail), q(c.Slug))
			total++
		}
		fmt.Fprintln(out)
	}
	fmt.Fprintln(out, "COMMIT;")
	log.Printf("เขียนสินค้า %d ชิ้น", total)
}
