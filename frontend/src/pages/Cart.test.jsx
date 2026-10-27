import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, MEMBER_KEY, TOKEN_KEY } from '../auth/AuthContext';
import Cart from './Cart';
import { fail, mockFetch, ok } from '../testUtils';

const item = (over) => ({
  productId: 1, name: 'iPad Mini', price: 15000, stock: 5, imageUrl: null, isActive: true, qty: 1, subtotal: 15000, ...over,
});

function renderCart() {
  localStorage.setItem(TOKEN_KEY, 'jwt');
  localStorage.setItem(MEMBER_KEY, JSON.stringify({ id: 1, displayName: 'เนส', role: 'member', phone: '0812345678', address: '123 ขอนแก่น 40000' }));
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders/:id" element={<h1>หน้าออเดอร์</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

beforeEach(() => localStorage.clear());

test('ตะกร้าว่าง ต้องแสดง Empty state และไม่มีฟอร์มสั่งซื้อ', async () => {
  mockFetch({ '/api/cart': ok({ items: [], total: 0 }) });
  renderCart();

  expect(await screen.findByText('ตะกร้ายังว่างอยู่')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'ยืนยันสั่งซื้อ' })).not.toBeInTheDocument();
});

test('เปลี่ยนจำนวน ส่ง PUT พร้อม token แล้วยอดรวมอัปเดตตามที่ server ตอบ', async () => {
  const fetch = mockFetch({ '/api/cart': ok({ items: [item()], total: 15000 }) });
  renderCart();
  expect(await screen.findByTestId('cart-total')).toHaveTextContent('฿15,000');

  mockFetch({ '/api/cart': ok({ items: [item({ qty: 3, subtotal: 45000 })], total: 45000 }) });
  await userEvent.selectOptions(screen.getByLabelText('จำนวน iPad Mini'), '3');

  expect(await screen.findByTestId('cart-total')).toHaveTextContent('฿45,000');
  const [url, options] = global.fetch.mock.calls[0];
  expect(new URL(url).pathname).toBe('/api/cart/1');
  expect(options.method).toBe('PUT');
  expect(options.headers.Authorization).toBe('Bearer jwt');
  expect(JSON.parse(options.body)).toEqual({ qty: 3 });
  expect(fetch).toHaveBeenCalledTimes(1); // โหลดตะกร้าครั้งแรกครั้งเดียว
});

test('สั่งซื้อไม่ผ่านเพราะสต็อกไม่พอ ต้องแสดงข้อความจาก server และอยู่หน้าเดิม', async () => {
  mockFetch({ '/api/cart': ok({ items: [item()], total: 15000 }) });
  renderCart();
  await screen.findByTestId('cart-total');

  mockFetch({ '/api/orders': fail(409, 'สินค้า iPad Mini มีไม่พอหรือปิดขายแล้ว') });
  await userEvent.click(screen.getByRole('button', { name: 'ยืนยันสั่งซื้อ' }));

  const form = screen.getByRole('button', { name: 'ยืนยันสั่งซื้อ' }).closest('form');
  expect(await within(form).findByRole('alert')).toHaveTextContent('มีไม่พอ');
  expect(screen.queryByRole('heading', { name: 'หน้าออเดอร์' })).not.toBeInTheDocument();
});

test('สั่งซื้อสำเร็จ ส่งที่อยู่ที่กรอกไว้ แล้วพาไปหน้าออเดอร์', async () => {
  mockFetch({ '/api/cart': ok({ items: [item()], total: 15000 }) });
  renderCart();
  await screen.findByTestId('cart-total');

  mockFetch({ '/api/orders': { status: 201, body: { id: 9, status: 'pending' } } });
  await userEvent.click(screen.getByRole('button', { name: 'ยืนยันสั่งซื้อ' }));

  expect(await screen.findByRole('heading', { name: 'หน้าออเดอร์' })).toBeInTheDocument();
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
    shipName: 'เนส', shipPhone: '0812345678', shipAddress: '123 ขอนแก่น 40000',
  });
});
