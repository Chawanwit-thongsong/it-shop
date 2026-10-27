import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, TOKEN_KEY } from '../auth/AuthContext';
import Login from './Login';
import { fail, mockFetch, ok } from '../testUtils';

function renderLogin(from) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[{ pathname: '/login', state: from && { from } }]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<h1>หน้าแรก</h1>} />
          <Route path="/cart" element={<h1>หน้าตะกร้า</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

beforeEach(() => localStorage.clear());

test('กดเข้าสู่ระบบโดยไม่กรอก ต้องเห็น error และไม่ยิง API', async () => {
  const fetch = mockFetch({});
  renderLogin();

  await userEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

  expect(screen.getByRole('alert')).toHaveTextContent('กรุณากรอกอีเมลและรหัสผ่าน');
  expect(fetch).not.toHaveBeenCalled();
});

test('login สำเร็จ ส่งอีเมล/รหัสถูกต้อง เก็บ token และพากลับไปหน้าที่ตั้งใจเข้า', async () => {
  const fetch = mockFetch({
    '/api/auth/login': ok({ token: 'jwt-123', member: { id: 1, displayName: 'เนส', role: 'member' } }),
  });
  renderLogin('/cart');

  await userEvent.type(screen.getByLabelText('อีเมล'), 'ness@example.com');
  await userEvent.type(screen.getByLabelText('รหัสผ่าน'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

  expect(await screen.findByRole('heading', { name: 'หน้าตะกร้า' })).toBeInTheDocument();
  const [, options] = fetch.mock.calls[0];
  expect(options.method).toBe('POST');
  expect(JSON.parse(options.body)).toEqual({ email: 'ness@example.com', password: 'password123' });
  expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-123');
});

test('รหัสผิด ต้องแสดงข้อความจาก server และยังอยู่หน้าเดิม', async () => {
  mockFetch({ '/api/auth/login': fail(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง') });
  renderLogin();

  await userEvent.type(screen.getByLabelText('อีเมล'), 'ness@example.com');
  await userEvent.type(screen.getByLabelText('รหัสผ่าน'), 'wrongpass');
  await userEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
});
