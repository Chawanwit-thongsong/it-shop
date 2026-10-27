import { NavLink, Outlet } from 'react-router-dom';

const link = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`;

// โครงหน้าหลังบ้าน: เมนูซ้าย + เนื้อหาหน้าลูก (Outlet)
function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
      <aside className="md:w-48">
        <p className="mb-2 px-3 text-xs font-semibold uppercase text-slate-400">หลังบ้าน</p>
        <nav className="space-y-1">
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
