import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, MEMBER_KEY, TOKEN_KEY } from '../auth/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RequireRole from './RequireRole';

function renderAt(path) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<h1>หน้า Login</h1>} />
          <Route path="/profile" element={<ProtectedRoute><h1>หน้าโปรไฟล์</h1></ProtectedRoute>} />
          <Route path="/admin" element={<RequireRole role="admin"><h1>หลังบ้าน</h1></RequireRole>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

function loginAs(role) {
  localStorage.setItem(TOKEN_KEY, 'fake.jwt');
  localStorage.setItem(MEMBER_KEY, JSON.stringify({ id: 1, displayName: 'Test', role }));
}

beforeEach(() => localStorage.clear());

test('Guest เข้าหน้าโปรไฟล์ ต้องถูกพาไปหน้า Login', () => {
  renderAt('/profile');
  expect(screen.getByRole('heading', { name: 'หน้า Login' })).toBeInTheDocument();
  expect(screen.queryByText('หน้าโปรไฟล์')).not.toBeInTheDocument();
});

test('Member ที่ login แล้ว เข้าหน้าโปรไฟล์ได้', () => {
  loginAs('member');
  renderAt('/profile');
  expect(screen.getByRole('heading', { name: 'หน้าโปรไฟล์' })).toBeInTheDocument();
});

test('Member เข้าหลังบ้านไม่ได้ ต้องเห็น 403', () => {
  loginAs('member');
  renderAt('/admin');
  expect(screen.getByText('403')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'หลังบ้าน' })).not.toBeInTheDocument();
});

test('Admin เข้าหลังบ้านได้', () => {
  loginAs('admin');
  renderAt('/admin');
  expect(screen.getByRole('heading', { name: 'หลังบ้าน' })).toBeInTheDocument();
});
