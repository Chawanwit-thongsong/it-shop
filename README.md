# IT Shop: ร้านขายอุปกรณ์ไอที

Term Project วิชา Client-Server Web Development

- **Frontend:** React (CRA) + React Router + Tailwind, เรียก API ด้วย Fetch → deploy บน **Vercel**
- **Backend:** Go `net/http` + `pgx` + JWT (`golang-jwt`) + bcrypt → deploy บน **Render**
- **Database:** PostgreSQL บน **Supabase**

| | URL |
|---|---|
| หน้าเว็บ | _ใส่ URL Vercel_ |
| API | _ใส่ URL Render_ |

แผนงานทั้งหมดและ checklist ตามเกณฑ์อยู่ใน [PLAN.md](PLAN.md)

---

## โครงโปรเจกต์

```
backend/
  main.go          อ่าน ENV, ต่อ DB, สตาร์ต server
  routes.go        รวมทุกเส้นทาง API + กำหนดสิทธิ์ (login / admin)
  auth/            bcrypt + ออก/ตรวจ JWT
  mw/              middleware: RequireLogin, RequireRole, CORS, Logging
  handler/         รับ request, validate, ตอบ JSON (ไม่มี SQL)
  store/           model + SQL ทั้งหมด (pgx, ใช้ $1 กัน SQL injection)
  db/              schema.sql, seed.sql
  cmd/seedgen/     สคริปต์ดึงสินค้าจาก DummyJSON → db/seed.sql
frontend/src/
  api/backend.js   จุดเดียวที่เรียก fetch
  auth/            AuthContext (เก็บ token + member)
  hooks/useApi.js  จัดการ loading / error / data ให้ทุกหน้า
  components/      Navbar, ProductCard, States (Loading/Empty/Error), ProtectedRoute, RequireRole
  pages/           หน้าร้าน + หน้าสมาชิก
  pages/admin/     หลังบ้าน
```

เส้นทางข้อมูล: `React page → api/backend.js (fetch + Bearer token) → Go routes.go → mw (ตรวจ token/role) → handler → store (SQL) → Supabase → JSON กลับ → React อัปเดตหน้าจอ`

## API

| สิทธิ์ | Method | Path | หมายเหตุ |
|---|---|---|---|
| Guest | POST | /api/auth/register | `{email, password, displayName}` |
| Guest | POST | /api/auth/login | ได้ `{token, member}` |
| Guest | GET | /api/categories | |
| Guest | GET | /api/products?q=&category=&page=&limit= | ได้ `{items, total, page, limit}` |
| Guest | GET | /api/products/{id} | |
| Member | GET / PUT | /api/me | ดู/แก้ชื่อ เบอร์ ที่อยู่ |
| Member | PUT | /api/me/password | `{currentPassword, newPassword}` |
| Member | GET / POST | /api/cart | ดูตะกร้า / เพิ่ม `{productId, qty}` (ทุกเส้นตอบตะกร้าล่าสุด) |
| Member | PUT / DELETE | /api/cart/{productId} | แก้จำนวน `{qty}` / ลบ |
| Member | POST | /api/orders | checkout `{shipName, shipPhone, shipAddress}` (transaction: เช็กสต็อก → สร้างออเดอร์ → ตัดสต็อก → ล้างตะกร้า) |
| Member | GET | /api/orders · /api/orders/{id} | ของตัวเองเท่านั้น (ของคนอื่นได้ 404) |
| Member | PUT | /api/orders/{id}/cancel | เฉพาะ pending แล้วคืนสต็อก |
| Admin | GET | /api/admin/stats | ยอดขาย, จำนวนออเดอร์ตามสถานะ, สินค้าใกล้หมด, ออเดอร์ล่าสุด |
| Admin | GET / POST | /api/admin/products | เห็นสินค้าที่ปิดขายด้วย |
| Admin | GET / PUT / DELETE | /api/admin/products/{id} | DELETE = ปิดขาย (soft delete) |
| Admin | GET | /api/admin/orders?status= · /api/admin/orders/{id} | |
| Admin | PUT | /api/admin/orders/{id}/status | `{status}` เปลี่ยนได้ตามลำดับ pending → paid → shipped → done (ยกเลิกได้ตอน pending/paid) |
| Admin | GET | /api/admin/members | |
| Admin | PUT | /api/admin/members/{id}/role | `{role}` เปลี่ยนของตัวเองไม่ได้ |

Error ทุกเส้นใช้รูปแบบเดียวกัน: `{"error": {"code": "...", "message": "..."}}` · ไม่มี token = 401, role ไม่พอ = 403
