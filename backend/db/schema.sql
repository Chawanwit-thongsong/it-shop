-- IT Shop database schema (PostgreSQL 14+ / Supabase)
-- รันไฟล์นี้ก่อน แล้วค่อยรัน seed.sql
-- ราคาเก็บเป็นบาทเต็ม (INTEGER) ไม่มีสตางค์ จะได้ไม่เจอปัญหาทศนิยมปัดเศษ

BEGIN;

DROP TABLE IF EXISTS order_items, orders, cart_items, products, categories, members CASCADE;

-- ---------------------------------------------------------------------------
-- members: ผู้ใช้ทุกคน (member และ admin อยู่ตารางเดียวกัน แยกด้วย role)
-- ---------------------------------------------------------------------------
CREATE TABLE members (
    id             BIGSERIAL    PRIMARY KEY,
    email          VARCHAR(255) NOT NULL,
    password_hash  TEXT         NOT NULL,                 -- bcrypt ไม่เก็บรหัสจริง
    display_name   VARCHAR(50)  NOT NULL,
    phone          VARCHAR(20),
    address        TEXT,                                  -- ที่อยู่จัดส่งตั้งต้น
    role           VARCHAR(10)  NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX members_email_key ON members (lower(email)); -- กันสมัครซ้ำแบบตัวพิมพ์เล็กใหญ่ต่างกัน

-- ---------------------------------------------------------------------------
-- categories: หมวดสินค้า (slug ใช้ใน URL เช่น /products?category=laptops)
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
    id    SERIAL      PRIMARY KEY,
    slug  VARCHAR(50) NOT NULL UNIQUE,
    name  VARCHAR(50) NOT NULL
);

-- ---------------------------------------------------------------------------
-- products: สินค้า  ลบจริงไม่ได้ถ้ามีออเดอร์อ้างถึง จึงใช้ is_active = false แทน (soft delete)
-- ---------------------------------------------------------------------------
CREATE TABLE products (
    id           BIGSERIAL    PRIMARY KEY,
    category_id  INTEGER      NOT NULL REFERENCES categories (id),
    name         VARCHAR(255) NOT NULL,
    brand        VARCHAR(100),
    description  TEXT,
    price        INTEGER      NOT NULL CHECK (price >= 0),
    stock        INTEGER      NOT NULL DEFAULT 0 CHECK (stock >= 0),   -- DB กันสต็อกติดลบอีกชั้น
    image_url    TEXT,
    is_active    BOOLEAN      NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON products (category_id);

-- ---------------------------------------------------------------------------
-- cart_items: ตะกร้าของสมาชิก 1 แถวต่อ 1 สินค้า
-- ---------------------------------------------------------------------------
CREATE TABLE cart_items (
    member_id   BIGINT  NOT NULL REFERENCES members (id) ON DELETE CASCADE,
    product_id  BIGINT  NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    qty         INTEGER NOT NULL CHECK (qty > 0),
    PRIMARY KEY (member_id, product_id)
);

-- ---------------------------------------------------------------------------
-- orders + order_items: ออเดอร์  unit_price เก็บราคา ณ ตอนซื้อ admin แก้ราคาทีหลังออเดอร์เก่าไม่เพี้ยน
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
    id            BIGSERIAL   PRIMARY KEY,
    member_id     BIGINT      NOT NULL REFERENCES members (id),
    total         INTEGER     NOT NULL CHECK (total >= 0),
    status        VARCHAR(10) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'paid', 'shipped', 'done', 'cancelled')),
    ship_name     VARCHAR(50) NOT NULL,
    ship_phone    VARCHAR(20) NOT NULL,
    ship_address  TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_member_idx ON orders (member_id);

CREATE TABLE order_items (
    order_id    BIGINT       NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id  BIGINT       NOT NULL REFERENCES products (id),
    name        VARCHAR(255) NOT NULL,          -- ชื่อ ณ ตอนซื้อ
    unit_price  INTEGER      NOT NULL CHECK (unit_price >= 0),
    qty         INTEGER      NOT NULL CHECK (qty > 0),
    PRIMARY KEY (order_id, product_id)
);

-- Supabase เปิด Data API ให้ทุกตารางใน public: เปิด RLS โดยไม่มี policy = ปิดทางเข้าจาก anon key
-- แอปเราต่อผ่าน Go ด้วย DATABASE_URL (สิทธิ์ postgres) จึงไม่โดนผลกระทบ
ALTER TABLE members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

COMMIT;
