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

---

## รันในเครื่อง

**1. Database** (เลือกอย่างใดอย่างหนึ่ง)
- Supabase: SQL Editor → รัน `backend/db/schema.sql` แล้วตามด้วย `backend/db/seed.sql`
- หรือ Docker:
  ```bash
  docker run -d --name itshop-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=itshop -p 5432:5432 postgres:16-alpine
  docker exec -i itshop-pg psql -U postgres -d itshop < backend/db/schema.sql
  docker exec -i itshop-pg psql -U postgres -d itshop < backend/db/seed.sql
  ```

**2. Backend**
```bash
cd backend
cp .env.example .env      # แก้ DATABASE_URL / JWT_SECRET
go run .                  # http://localhost:8080/api/health
go test ./...
```

**3. Frontend**
```bash
cd frontend
cp .env.example .env.local
npm install
npm start                 # http://localhost:3000
npm test
```

**4. สร้างบัญชี admin:** สมัครผ่านหน้าเว็บก่อน แล้วรัน SQL
```sql
UPDATE members SET role = 'admin' WHERE email = 'อีเมลที่สมัคร';
```
จากนั้น logout แล้ว login ใหม่ (token เดิมยังเป็น role เก่า)

---

## Deploy

**Supabase**
1. New project → SQL Editor → รัน `schema.sql` และ `seed.sql`
2. กด Connect → เลือก **Session pooler** → คัดลอก URI ไว้ใช้เป็น `DATABASE_URL` (Render ต่อ IPv6 ของ Direct connection ไม่ได้)

**Render (Backend)**
1. New → Web Service → เชื่อม GitHub repo นี้
2. Root Directory: `backend` · Runtime: Go · Build: `go build -o app .` · Start: `./app`
3. Environment: `DATABASE_URL`, `JWT_SECRET` (สุ่มยาว ≥ 32 ตัว), `ALLOWED_ORIGINS` (= URL Vercel ไม่มี `/` ท้าย)
4. เปิด `https://<render-url>/api/health` ต้องได้ `{"ok":true}`

**Vercel (Frontend)**
1. Import repo → Root Directory: `frontend` (Framework: Create React App)
2. Environment Variable: `REACT_APP_API_URL` = URL Render
3. Deploy แล้วกลับไปใส่ URL Vercel ใน `ALLOWED_ORIGINS` ของ Render

> Render แผนฟรีหลับเมื่อไม่มีคนใช้ ~15 นาที ครั้งแรกโหลดช้า ~30-60 วิ (ก่อนอัดคลิปให้เปิด /api/health ปลุกไว้ก่อน)

---

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
| Admin | GET / POST | /api/admin/products | เห็นสินค้าที่ปิดขายด้วย |
| Admin | GET / PUT / DELETE | /api/admin/products/{id} | DELETE = ปิดขาย (soft delete) |
| _รอบถัดไป_ | | /api/cart, /api/orders, /api/admin/orders, /api/admin/members, /api/admin/stats | |

Error ทุกเส้นใช้รูปแบบเดียวกัน: `{"error": {"code": "...", "message": "..."}}` · ไม่มี token = 401, role ไม่พอ = 403

---

## ผู้จัดทำ

| ชื่อ | รหัส | ส่วนที่รับผิดชอบ |
|---|---|---|
| | | Auth + Member (สมัคร, login, โปรไฟล์, ตะกร้า, ออเดอร์) |
| | | Guest + Admin (หน้าร้าน, จัดการสินค้า/ออเดอร์/สมาชิก) |

ข้อมูลสินค้าตัวอย่างจาก [DummyJSON](https://dummyjson.com)
