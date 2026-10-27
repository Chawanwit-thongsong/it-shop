# แผนงาน Term Project: ร้านขายอุปกรณ์ IT (React + Fetch API + Go)

ทีม 2 คน, 20 คะแนน/คน = ผลงานกลุ่ม 13 + สาธิตทีม 2 + อธิบายรายบุคคล 5
อ้างอิงโครงจาก `week6-lab/moviehub` (BE) และ `moviehub-670710714` (FE)

---

## 0. Tech Stack (ใช้ตามที่เรียนเท่านั้น)

- FE: React (CRA) + react-router-dom + Tailwind, ใช้ Fetch ผ่าน `src/api/backend.js` ตัวเดียว
- BE: Go `net/http` (ServeMux แบบ `"GET /api/x/{id}"`), `pgx/v5` (pgxpool + SQL `$1`), `golang-jwt/jwt/v5`, bcrypt (`x/crypto`), `godotenv`
- DB: PostgreSQL บน Supabase
- Test: Jest + React Testing Library (`npm test`)
- Deploy: FE → Vercel, BE → Render (เชื่อม GitHub repo, auto deploy), DB → Supabase
- ห้าม: ORM (GORM), axios, Gin/Fiber, Firebase, ให้ FE ยิง Supabase/DummyJSON ตรง

---

## 1. Checklist เกณฑ์ → งานที่ต้องทำ

### 1.1 Tech Stack / Deploy (2)
- [ ] repo เดียว แยก `frontend/` และ `backend/`
- [ ] Supabase: สร้าง project, รัน `schema.sql` + `seed.sql`
- [ ] Render: Web Service ชี้ repo, Root Directory = `backend`, Build `go build -o app .`, Start `./app`
- [ ] Render ENV: `DATABASE_URL` (ใช้ Session pooler ของ Supabase), `JWT_SECRET` (≥32 ตัว), `ALLOWED_ORIGINS` (= URL Vercel)
- [ ] Vercel: Root Directory = `frontend`, ENV `REACT_APP_API_URL` = URL Render
- [ ] React Router บน Vercel: เพิ่ม `frontend/vercel.json` rewrite ทุก path → `/index.html` (กัน refresh แล้ว 404)
- [ ] ทดสอบบน URL จริงครบทุก flow (ไม่ใช่ localhost)

### 1.2 ระบบสมาชิก (2) — ต้องได้ครบ 4 อย่าง
- [ ] Register: validate email ซ้ำ (409), รหัสผ่าน ≥ 8, เก็บ bcrypt hash
- [ ] Login: คืน JWT (มี member_id + role, หมดอายุ 1 ชม.) / Logout: ลบ token ฝั่ง FE แล้วเด้งไปหน้าแรก
- [ ] Profile: ดู/แก้ ชื่อ, เบอร์, ที่อยู่ (`GET/PUT /api/me`)
- [ ] เปลี่ยน Password: ต้องกรอกรหัสเดิม ตรวจด้วย bcrypt ก่อนเปลี่ยน (`PUT /api/me/password`)

### 1.3 Guest / Member / Admin (4) — คะแนนเยอะสุด
- [ ] Guest: ดูสินค้า, ค้นหา, กรองหมวด, ดูรายละเอียด. กดใส่ตะกร้า → พาไป Login
- [ ] Member: ตะกร้า (เพิ่ม/แก้จำนวน/ลบ), Checkout, ดูประวัติออเดอร์ + สถานะ, ยกเลิกออเดอร์ที่ยัง pending
- [ ] Admin: Dashboard สถิติ, CRUD สินค้า, ดู/เปลี่ยนสถานะออเดอร์, ดูสมาชิก/เปลี่ยน role
- [ ] **Backend ตรวจสิทธิ์**: ทุก route Member ผ่าน `login(...)`, ทุก route `/api/admin/*` ผ่าน `admin(...)`
- [ ] Member ดู/ยกเลิกได้เฉพาะออเดอร์ของตัวเอง (WHERE member_id = จาก token ไม่ใช่จาก body) → ของคนอื่นตอบ 404
- [ ] FE: `ProtectedRoute` (ต้อง login), `RequireRole("admin")` (ต้องเป็น admin) — เป็นแค่ชั้นเสริม
- [ ] เตรียมเดโมในคลิป: ยิง `/api/admin/...` ด้วย token member → ได้ 403, ไม่มี token → 401

### 1.4 API / Database / UI (2)
- [ ] ทุกข้อมูลวิ่ง React → Fetch → Go → Supabase จริง (ไม่มี mock/ข้อมูล hardcode ใน FE)
- [ ] ทำ component กลาง `<Loading/>` `<Empty/>` `<ErrorBox onRetry/>` ใช้ทุกหน้าที่ fetch
- [ ] หน้าที่ต้องมีครบ 3 สถานะ: รายการสินค้า, รายละเอียดสินค้า, ตะกร้า, ออเดอร์ของฉัน, Admin สินค้า/ออเดอร์/สมาชิก/Dashboard
- [ ] Error format เดียวกันทุก endpoint: `{"error":{"code":"...","message":"..."}}`
- [ ] Checkout ทำใน transaction: เช็ค stock → สร้าง order + order_items → ตัด stock → ล้างตะกร้า (พลาดจุดไหน rollback)

### 1.5 React Unit Test (1) — ต้องตรวจพฤติกรรมจริง
- [ ] `LoginForm.test.jsx`: ไม่กรอกแล้วกดส่ง → แสดง error, ไม่เรียก onSubmit / กรอกครบ → เรียกด้วยค่าที่ถูก
- [ ] `ProductList.test.jsx`: mock fetch คืน [] → เห็นข้อความ Empty / คืน error → เห็น ErrorBox / คืนข้อมูล → เห็นชื่อสินค้า
- [ ] `ProtectedRoute.test.jsx`: ไม่มี token → redirect ไป /login, role member เข้าหน้า admin ไม่ได้
- [ ] `Cart.test.jsx`: เปลี่ยนจำนวนแล้วราคารวมถูกต้อง
- [ ] `npm test -- --watchAll=false` ผ่านทั้งหมด (ทำ GitHub Actions รัน test ได้ด้วยแบบใน moviehub repo)
- (เสริม) Go test: `auth/token_test.go` แบบในแลป

### 1.6 Project Structure (2)
- [ ] ตามโครงในหัวข้อ 2 ด้านล่าง ตั้งชื่อชัด แยกหน้าที่
- [ ] ค่าคงที่/secret อยู่ใน `.env` เท่านั้น, commit แค่ `.env.example`, `.env` อยู่ใน `.gitignore`
- [ ] README: วิธีรัน local, ENV ที่ต้องตั้ง, URL ที่ deploy แล้ว, บัญชีทดสอบ, ใครทำส่วนไหน

---

## 2. โครง Repo

```
it-shop/
├── backend/
│   ├── main.go            # ต่อ DB, สร้าง mux, ผูก route + middleware
│   ├── go.mod
│   ├── .env.example       # DATABASE_URL, JWT_SECRET, ALLOWED_ORIGINS, PORT
│   ├── auth/              # password.go (bcrypt), token.go (JWT) + token_test.go
│   ├── mw/                # auth.go (RequireLogin/RequireRole), cors.go, logging.go
│   ├── handler/           # handler.go (helper JSON), auth.go, products.go, cart.go, orders.go, admin.go
│   ├── store/             # store.go + members.go, products.go, cart.go, orders.go, admin.go (SQL ทั้งหมดอยู่ที่นี่)
│   └── db/                # schema.sql, seed.sql, cmd สคริปต์ดึง DummyJSON → seed.sql
└── frontend/
    ├── vercel.json
    ├── .env.example       # REACT_APP_API_URL
    └── src/
        ├── api/backend.js # apiFetch + ฟังก์ชันเรียกทุก endpoint
        ├── auth/AuthContext.jsx
        ├── components/    # Navbar, ProductCard, States (Loading/Empty/ErrorBox), ProtectedRoute, RequireRole
        ├── pages/         # Home, Products, ProductDetail, Login, Register, Cart, Checkout, MyOrders, Profile
        └── pages/admin/   # AdminLayout, Dashboard, AdminProducts, AdminProductForm, AdminOrders, AdminMembers
```

---

## 3. Database (Supabase / PostgreSQL)

```
members     id, email UNIQUE, password_hash, name, phone, address, role ('member'|'admin'), created_at
categories  id, name
products    id, category_id → categories, name, description, price NUMERIC(10,2), stock INT ≥ 0, image_url, is_active, created_at
cart_items  member_id → members, product_id → products, qty > 0, PRIMARY KEY (member_id, product_id)
orders      id, member_id → members, total, status ('pending'|'paid'|'shipped'|'done'|'cancelled'), ship_address, created_at
order_items order_id → orders, product_id → products, qty, unit_price   -- เก็บราคา ณ ตอนซื้อ
```

- ข้อมูลตั้งต้น: DummyJSON หมวด laptops(5) smartphones(16) tablets(3) mobile-accessories(14) = 38 ชิ้น + เพิ่มเองได้
- ลบสินค้า = soft delete (`is_active = false`) เพราะมี order_items อ้างถึงอยู่
- seed บัญชี admin 1 คน (สร้างผ่าน register แล้ว UPDATE role ใน Supabase)

---

## 4. API

| สิทธิ์ | Method + Path | หน้าที่ |
|---|---|---|
| Guest | POST /api/auth/register | สมัคร |
| Guest | POST /api/auth/login | คืน token |
| Guest | GET /api/categories | หมวดทั้งหมด |
| Guest | GET /api/products?q=&category=&page= | ค้นหา/กรอง |
| Guest | GET /api/products/{id} | รายละเอียด |
| Member | GET /api/me · PUT /api/me | ดู/แก้โปรไฟล์ |
| Member | PUT /api/me/password | เปลี่ยนรหัส |
| Member | GET /api/cart · POST /api/cart · PUT /api/cart/{productId} · DELETE /api/cart/{productId} | ตะกร้า |
| Member | POST /api/orders | Checkout (transaction) |
| Member | GET /api/orders · GET /api/orders/{id} | ออเดอร์ของฉัน |
| Member | PUT /api/orders/{id}/cancel | ยกเลิก (pending เท่านั้น, คืน stock) |
| Admin | GET /api/admin/stats | ยอดขาย, จำนวนออเดอร์, สินค้าใกล้หมด |
| Admin | GET/POST /api/admin/products · PUT/DELETE /api/admin/products/{id} | CRUD สินค้า |
| Admin | GET /api/admin/orders?status= · PUT /api/admin/orders/{id}/status | จัดการออเดอร์ |
| Admin | GET /api/admin/members · PUT /api/admin/members/{id}/role | จัดการสมาชิก |

Status code ที่ใช้: 200, 201, 204, 400 (ข้อมูลผิด), 401 (ไม่มี/ผิด token), 403 (สิทธิ์ไม่พอ), 404, 409 (email ซ้ำ / stock ไม่พอ)

---

## 5. แบ่งงาน

> เนสเขียนโค้ดทั้ง A และ B เอง แต่ในคลิปเพื่อนต้องอธิบายโค้ดได้ 1 ส่วน (คะแนนรายบุคคล 5 คะแนน/คน)
> → ให้เพื่อนรับผิดชอบส่วน B (Guest + Admin) ในคลิป: อ่านโค้ด, ลองรัน, ลองแก้เล็กๆ เอง 1–2 จุด, จดปัญหาที่เจอเองในหัวข้อ 8
> → ให้เพื่อนทำงานร่วมจริงบางส่วน เช่น seed ข้อมูล, ตั้ง Supabase/Vercel, เขียน test 1–2 ตัว, README

(แบ่งตามฟีเจอร์ ใช้เป็นการแบ่ง "ความรับผิดชอบในคลิป")

**คน A — Auth + Member**
- BE: `auth/`, `mw/auth.go`, handler/store ของ auth, me, cart, orders (รวม transaction checkout/cancel)
- FE: AuthContext, Login, Register, Profile + เปลี่ยนรหัส, Cart, Checkout, MyOrders, ProtectedRoute
- Test: LoginForm, ProtectedRoute, Cart

**คน B — Guest + Admin**
- BE: schema/seed + สคริปต์ DummyJSON, handler/store ของ categories, products, admin ทั้งหมด, `mw/cors.go`
- FE: Home, Products (ค้นหา/กรอง), ProductDetail, States component, AdminLayout, Dashboard, AdminProducts/Form, AdminOrders, AdminMembers, RequireRole
- Test: ProductList (Loading/Empty/Error/มีข้อมูล), AdminProductForm

**ทำร่วม**: ตั้ง repo, Deploy 3 ที่, README, คลิป

---

## 6. ลำดับงาน (ไม่มีกำหนดวัน ทำตามลำดับ)

1. **ตั้งต้น** — repo + โครงโฟลเดอร์, schema/seed ขึ้น Supabase, BE มีแค่ `GET /api/products` → deploy Render + FE หน้ารายการสินค้า → deploy Vercel. *ให้ทั้ง 3 ที่ต่อกันติดก่อนเริ่มฟีเจอร์*
2. **Auth** — register/login/JWT/middleware, AuthContext, Navbar เปลี่ยนตาม role
3. **Guest** — ค้นหา/กรอง/รายละเอียด + States component
4. **Member** — ตะกร้า → checkout → ออเดอร์ของฉัน → profile/รหัสผ่าน
5. **Admin** — CRUD สินค้า → จัดการออเดอร์ → สมาชิก → dashboard
6. **Test + เก็บงาน** — unit test, เช็ค Loading/Empty/Error ทุกหน้า, README, ทดสอบบน URL จริง
7. **คลิป** — ตามสคริปต์หัวข้อ 7

---

## 7. คลิป (≤ 15 นาที, 7 คะแนน — วัดความเข้าใจ ไม่ใช่ความสวย)

**สาธิตระบบจริง (ทีม, 2)** ~5 นาที บน URL Vercel จริง
- Guest: ค้นหา/กรองสินค้า → กดใส่ตะกร้าแล้วโดนพาไป login
- Member: register → login → ใส่ตะกร้า → checkout → ดูสถานะออเดอร์ → แก้ profile → เปลี่ยนรหัส → logout
- Admin: เพิ่ม/แก้/ลบสินค้า → เปลี่ยนสถานะออเดอร์ (กลับไปดูฝั่ง member ว่าเปลี่ยนจริง) → เปลี่ยน role สมาชิก
- โชว์ backend ตรวจสิทธิ์: ยิง admin API ด้วย token member → 403

**โค้ด + เส้นทางข้อมูล (รายบุคคล, 3)** ~3 นาที/คน — เริ่มด้วยบอกชื่อ + ส่วนที่ทำ
- เลือก 1 flow ของตัวเองเล่าตั้งแต่ต้นจนจบ เช่น คน A: กด "สั่งซื้อ" → `backend.js` POST /api/orders + Bearer token → `mw.RequireLogin` ตรวจ token → `handler.CreateOrder` → `store` transaction (เช็ค stock, insert, ตัด stock) → Supabase → JSON กลับ → React อัปเดตหน้า
- คน B: Admin แก้สินค้า → PUT /api/admin/products/{id} → RequireLogin + RequireRole("admin") → handler validate → store UPDATE ... $1 → ผล

**เหตุผล + ปัญหาและวิธีแก้ (รายบุคคล, 2)** ~1.5 นาที/คน
- จดปัญหาจริงระหว่างทำลงหัวข้อ 8 ไว้เรื่อยๆ เลือกมาเล่า 1–2 เรื่อง บอกสาเหตุ + แก้ยังไง + ทำไมเลือกวิธีนี้
- ตัวอย่างที่น่าจะเจอ: CORS ระหว่าง Vercel–Render, Render หลับแล้วโหลดช้า (cold start), refresh หน้าแล้ว 404 บน Vercel, stock ติดลบเมื่อสั่งพร้อมกัน (แก้ด้วย transaction + `UPDATE ... WHERE stock >= qty`)

---

## 8. บันทึกปัญหาที่เจอ (เอาไปใช้ในคลิป)

| วันที่ | ใคร | ปัญหา | สาเหตุ | วิธีแก้ |
|---|---|---|---|---|
| | | | | |
