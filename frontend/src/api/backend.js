// ชั้นกลางสำหรับคุยกับ Backend Go ทุกหน้าเรียกผ่านไฟล์นี้เท่านั้น (หน้าอื่นไม่ต้องรู้ URL)
// ในเครื่อง: REACT_APP_API_URL=http://localhost:8080  บน Vercel: ใส่ URL ของ Render
const BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8080').replace(/\/$/, '');

// ฟังก์ชันเดียวที่ fetch จริง ทุกฟังก์ชันด้านล่างเรียกผ่านตัวนี้
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';  // 1) บอก server ว่า body เป็น JSON
  if (token) headers.Authorization = `Bearer ${token}`;     //    แนบ JWT ถ้ามี

  let res;
  try {
    res = await fetch(BASE + path, {                         // 2) ยิงจริง
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch พังเองแปลว่าไปไม่ถึง server (เน็ตหลุด, CORS, Render กำลังตื่น)
    throw new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง');
  }

  if (res.status === 204) return null;                       // 3) สำเร็จแต่ไม่มี body (ลบ, เปลี่ยนรหัส)

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {                                             // 4) 400/401/403/404/409 มาลงตรงนี้
    const err = new Error(data.error?.message ?? `เซิร์ฟเวอร์ตอบกลับ ${res.status}`);
    err.status = res.status;
    err.code = data.error?.code;
    throw err;
  }
  return data;
}

// ---------- สมาชิก ----------
export function register(email, password, displayName) {
  return apiFetch('/api/auth/register', { method: 'POST', body: { email, password, displayName } });
}
export function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } }); // ได้ { token, member }
}
export function getMe(token) {
  return apiFetch('/api/me', { token });
}
export function updateMe(fields, token) {
  return apiFetch('/api/me', { method: 'PUT', body: fields, token });
}
export function changePassword(currentPassword, newPassword, token) {
  return apiFetch('/api/me/password', { method: 'PUT', body: { currentPassword, newPassword }, token });
}

// ---------- สินค้า (Guest เรียกได้) ----------
export async function getCategories() {
  const data = await apiFetch('/api/categories');
  return data.items;
}
// params = { q, category, page, limit } ได้ { items, total, page, limit }
export function getProducts(params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  return apiFetch(`/api/products?${qs}`);
}
export function getProduct(id) {
  return apiFetch(`/api/products/${id}`);
}

// ---------- หลังบ้าน (ต้องแนบ token ของ admin ถ้าเป็น member Go ตอบ 403) ----------
export function getAdminProducts(params, token) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  return apiFetch(`/api/admin/products?${qs}`, { token });
}
export function getAdminProduct(id, token) {
  return apiFetch(`/api/admin/products/${id}`, { token });
}
export function createProduct(fields, token) {
  return apiFetch('/api/admin/products', { method: 'POST', body: fields, token });
}
export function updateProduct(id, fields, token) {
  return apiFetch(`/api/admin/products/${id}`, { method: 'PUT', body: fields, token });
}
export function deleteProduct(id, token) {
  return apiFetch(`/api/admin/products/${id}`, { method: 'DELETE', token });
}
