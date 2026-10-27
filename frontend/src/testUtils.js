// ตัวช่วยเทสต์: สร้าง fetch ปลอมที่ตอบตาม path (ไม่ยิงเน็ตจริง)
// routes = { '/api/products': { status: 200, body: {...} } } จับคู่ด้วย path ที่ขึ้นต้นตรงกัน (ยาวสุดชนะ)
export function mockFetch(routes) {
  global.fetch = jest.fn(async (url) => {
    const path = new URL(url).pathname;
    const key = Object.keys(routes)
      .filter((k) => path === k || path.startsWith(k + '/'))
      .sort((a, b) => b.length - a.length)[0];
    const route = routes[key];
    if (!route) throw new Error('ไม่ได้ mock ' + path);
    if (route.networkError) throw new TypeError('Failed to fetch');
    return {
      ok: route.status < 400,
      status: route.status,
      json: async () => route.body,
    };
  });
  return global.fetch;
}

export const ok = (body) => ({ status: 200, body });
export const fail = (status, message) => ({ status, body: { error: { code: 'X', message } } });
