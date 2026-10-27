import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as api from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { useApi } from '../hooks/useApi';
import { ErrorBox, Loading, btnPrimary } from '../components/States';
import { baht } from '../utils/format';

function ProductDetail() {
  const { id } = useParams();
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const { data: p, loading, error, reload } = useApi(useCallback(() => api.getProduct(id), [id]));
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleAddToCart() {
    // Guest กดแล้วพาไป login ก่อน แล้วเด้งกลับมาหน้านี้
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await api.addToCart(p.id, qty, token);
      setMsg({ ok: true, text: `ใส่ตะกร้าแล้ว ${qty} ชิ้น` });
    } catch (err) {
      setMsg({ ok: false, text: err.message }); // เช่น จำนวนเกินสต็อกที่มี
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        {error.status === 404 ? (
          <div className="text-center">
            <p className="text-muted">ไม่พบสินค้านี้</p>
            <Link to="/products" className="mt-2 inline-block font-medium text-accent-dark underline-offset-4 hover:underline">กลับไปหน้าสินค้า</Link>
          </div>
        ) : (
          <ErrorBox error={error} onRetry={reload} />
        )}
      </div>
    );
  }

  const soldOut = p.stock <= 0;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label="breadcrumb" className="flex gap-2 text-sm text-muted">
        <Link to="/products" className="hover:text-ink">สินค้า</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/products?category=${p.categorySlug}`} className="hover:text-ink">{p.categoryName}</Link>
      </nav>
      <div className="mt-6 grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="aspect-square rounded-plate bg-plate">
          {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain p-10 mix-blend-multiply" />}
        </div>
        <div className="md:pt-4">
          {p.brand && <p className="text-sm font-medium text-muted">{p.brand}</p>}
          <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tight text-ink">{p.name}</h1>
          <p className="mt-6 text-3xl font-semibold text-ink">{baht(p.price)}</p>
          <p className={`mt-2 flex items-center gap-2 text-sm ${soldOut ? 'text-red-700' : 'text-muted'}`}>
            <span className={`h-2 w-2 rounded-full ${soldOut ? 'bg-red-600' : p.stock <= 5 ? 'bg-amber-500' : 'bg-emerald-600'}`} />
            {soldOut ? 'สินค้าหมด' : p.stock <= 5 ? `เหลือ ${p.stock} ชิ้น` : 'มีสินค้าพร้อมส่ง'}
          </p>

          <div className="mt-8 flex items-stretch gap-3 border-t border-line pt-6">
            {isLoggedIn && !soldOut && (
              <select aria-label="จำนวน" value={qty} onChange={(e) => setQty(Number(e.target.value))}
                      className="rounded-[10px] border border-line bg-white px-3">
                {Array.from({ length: Math.min(p.stock, 10) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            )}
            <button onClick={handleAddToCart} disabled={soldOut || busy} className={`${btnPrimary} flex-1 py-3 text-base`}>
              {isLoggedIn ? (busy ? 'กำลังเพิ่ม...' : 'ใส่ตะกร้า') : 'เข้าสู่ระบบเพื่อสั่งซื้อ'}
            </button>
          </div>
          {msg && (
            <p role="status" className={`mt-3 text-sm ${msg.ok ? 'text-emerald-700' : 'text-red-700'}`}>
              {msg.text} {msg.ok && <Link to="/cart" className="font-medium underline underline-offset-2">ไปที่ตะกร้า</Link>}
            </p>
          )}
          {p.description && (
            <div className="mt-10">
              <h2 className="text-sm font-semibold text-ink">รายละเอียดสินค้า</h2>
              <p className="mt-2 max-w-prose whitespace-pre-line leading-relaxed text-muted">{p.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
