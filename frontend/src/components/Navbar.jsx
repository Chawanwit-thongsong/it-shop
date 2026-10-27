import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`;

function Navbar() {
  const { isLoggedIn, isAdmin, member, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-3">
        <Link to="/" className="mr-4 text-lg font-semibold text-indigo-700">IT Shop</Link>
        <NavLink to="/products" className={linkClass}>สินค้า</NavLink>
        {/* เมนูเปลี่ยนตามบทบาท: Guest / Member / Admin */}
        {isLoggedIn && <NavLink to="/cart" className={linkClass}>ตะกร้า</NavLink>}
        {isLoggedIn && <NavLink to="/orders" className={linkClass}>ออเดอร์ของฉัน</NavLink>}
        {isAdmin && <NavLink to="/admin" className={linkClass}>หลังบ้าน</NavLink>}

        <div className="ml-auto flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <NavLink to="/profile" className={linkClass}>{member?.displayName}</NavLink>
              <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-red-600">
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>เข้าสู่ระบบ</NavLink>
              <Link to="/register" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700">
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
