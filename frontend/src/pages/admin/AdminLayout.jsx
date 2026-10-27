import { NavLink, Outlet } from 'react-router-dom';

const link = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-ink font-medium text-white' : 'text-muted hover:bg-plate hover:text-ink'}`;

// โครงหน้าหลังบ้าน: เมนูซ้าย + เนื้อหาหน้าลูก (Outlet)
function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row">
      <aside className="md:w-48 md:shrink-0">
        <p className="mb-3 px-3 text-sm font-semibold text-ink">หลังบ้าน</p>
        <nav className="flex gap-1 overflow-x-auto md:block md:space-y-1">
          <NavLink to="/admin" end className={link}>Dashboard</NavLink>
          <NavLink to="/admin/products" className={link}>สินค้า</NavLink>
          <NavLink to="/admin/orders" className={link}>ออเดอร์</NavLink>
          <NavLink to="/admin/members" className={link}>สมาชิก</NavLink>
        </nav>
      </aside>
      <section className="min-w-0 flex-1">
        <Outlet />
      </section>
    </div>
  );
}

export default AdminLayout;
