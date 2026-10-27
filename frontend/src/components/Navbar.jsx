import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { useApi } from '../hooks/useApi';

const iconProps = {
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
};

function SearchIcon() {
  return <svg {...iconProps}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
}
function CartIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
      <circle cx="9.5" cy="20" r="1" /><circle cx="17.5" cy="20" r="1" />
    </svg>
  );
}

// ช่องค้นหาบนหัวเว็บ: กด Enter แล้วไปหน้า /products?q=...
function HeaderSearch() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const [text, setText] = useState('');

  useEffect(() => {
    setText(pathname === '/products' ? params.get('q') ?? '' : '');
  }, [pathname, params]);

  function handleSubmit(e) {
    e.preventDefault();
    const q = text.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="relative w-full">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50"><SearchIcon /></span>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="ค้นหาสินค้า เช่น iPhone, MacBook"
             aria-label="ค้นหาจากหัวเว็บ"
             className="w-full rounded-full border border-coal bg-coal py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/45 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25" />
    </form>
  );
}

function Navbar() {
  const { isLoggedIn, isAdmin, member, logout } = useAuth();
  const navigate = useNavigate();
  const cats = useApi(useCallback(() => api.getCategories(), []));
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const activeCat = pathname === '/products' ? params.get('category') ?? '' : null;

  function handleLogout() {
    logout();
    navigate('/');
  }

  const catLink = (active) =>
    `whitespace-nowrap border-b-2 py-3 text-sm transition-colors ${active ? 'border-accent font-medium text-white' : 'border-transparent text-white/60 hover:text-white'}`;
  const navText = 'rounded-full px-3 py-2 text-white/70 transition-colors hover:text-white';

  return (
    <header className="sticky top-0 z-40 bg-ink text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:gap-8">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="IT Shop หน้าแรก">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-[13px] font-bold text-ink">IT</span>
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">IT Shop</span>
        </Link>

        <div className="hidden flex-1 md:block"><HeaderSearch /></div>

        {/* เมนูขวาเปลี่ยนตามบทบาท: Guest / Member / Admin */}
        <nav className="ml-auto flex items-center gap-1 text-sm md:ml-0">
          {isAdmin && (
            <NavLink to="/admin" className="rounded-full px-3 py-2 font-medium text-accent hover:bg-white/10">หลังบ้าน</NavLink>
          )}
          {isLoggedIn ? (
            <>
              <NavLink to="/orders" className={`hidden sm:block ${navText}`}>ออเดอร์</NavLink>
              <NavLink to="/profile" className={`max-w-[9rem] truncate ${navText}`}>
                {member?.displayName}
              </NavLink>
              <button onClick={handleLogout} className={navText}>ออกจากระบบ</button>
              <NavLink to="/cart" aria-label="ตะกร้า"
                       className={({ isActive }) => `ml-1 grid h-10 w-10 place-items-center rounded-full transition-colors ${isActive ? 'bg-accent text-ink' : 'bg-coal text-white hover:bg-white/15'}`}>
                <CartIcon />
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navText}>เข้าสู่ระบบ</NavLink>
              <Link to="/register" className="rounded-full bg-accent px-4 py-2 font-semibold text-ink transition-colors hover:bg-accent-hover">สมัครสมาชิก</Link>
            </>
          )}
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden"><HeaderSearch /></div>

      {/* แถบหมวดสินค้า ดึงจาก API */}
      <div className="border-t border-white/10">
        <nav aria-label="หมวดสินค้า" className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4">
          <Link to="/products" className={catLink(activeCat === '')}>สินค้าทั้งหมด</Link>
          {cats.data?.map((c) => (
            <Link key={c.id} to={`/products?category=${c.slug}`} className={catLink(activeCat === c.slug)}>{c.name}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
