import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Products from './Products';
import { fail, mockFetch, ok } from '../testUtils';

const categories = ok({ items: [{ id: 1, slug: 'laptops', name: 'โน้ตบุ๊ก' }] });
const product = {
  id: 7, name: 'MacBook Pro 14', brand: 'Apple', categoryName: 'โน้ตบุ๊ก',
  price: 69990, stock: 3, imageUrl: null, isActive: true,
};

function renderProducts(url = '/products') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Products />
    </MemoryRouter>,
  );
}

test('ระหว่างรอข้อมูลแสดง Loading แล้วตามด้วยรายการสินค้าพร้อมราคา', async () => {
  mockFetch({ '/api/categories': categories, '/api/products': ok({ items: [product], total: 1, page: 1, limit: 12 }) });
  renderProducts();

  expect(screen.getByText('กำลังโหลดสินค้า...')).toBeInTheDocument();
  expect(await screen.findByText('MacBook Pro 14')).toBeInTheDocument();
  expect(screen.getByText('฿69,990')).toBeInTheDocument();
  expect(screen.getByText('พบ 1 รายการ')).toBeInTheDocument();
});

test('ไม่มีสินค้าตรงเงื่อนไข ต้องแสดง Empty state', async () => {
  mockFetch({ '/api/categories': categories, '/api/products': ok({ items: [], total: 0, page: 1, limit: 12 }) });
  renderProducts('/products?q=ไม่มีแน่นอน');

  expect(await screen.findByText('ไม่พบสินค้า')).toBeInTheDocument();
  // คำค้นใน URL ต้องถูกส่งไปที่ API ด้วย
  const productCall = global.fetch.mock.calls.map(([u]) => new URL(u)).find((u) => u.pathname === '/api/products');
  expect(productCall.searchParams.get('q')).toBe('ไม่มีแน่นอน');
});

test('API พัง ต้องแสดง Error และกดลองใหม่แล้วโหลดได้', async () => {
  mockFetch({ '/api/categories': categories, '/api/products': fail(500, 'ระบบขัดข้อง ลองใหม่อีกครั้ง') });
  renderProducts();

  expect(await screen.findByRole('alert')).toHaveTextContent('ระบบขัดข้อง ลองใหม่อีกครั้ง');

  mockFetch({ '/api/categories': categories, '/api/products': ok({ items: [product], total: 1, page: 1, limit: 12 }) });
  await userEvent.click(screen.getByRole('button', { name: 'ลองใหม่' }));

  expect(await screen.findByText('MacBook Pro 14')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
