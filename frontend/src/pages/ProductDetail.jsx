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
            <p className="text-slate-500">ไม่พบสินค้านี้</p>
            <Link to="/products" className="mt-2 inline-block text-indigo-600 hover:underline">กลับไปหน้าสินค้า</Link>
          </div>
        ) : (
          <ErrorBox error={error} onRetry={reload} />
        )}
      </div>
    );
  }

  const soldOut = p.stock <= 0;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/products" className="text-sm text-slate-500 hover:text-indigo-600">← สินค้าทั้งหมด</Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-2xl border border-slate-200 bg-white">
          {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain p-8" />}
        </div>
        <div>
          <p className="text-sm text-slate-400">{p.categoryName}{p.brand && ` · ${p.brand}`}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{p.name}</h1>
          <p className="mt-4 text-3xl font-semibold text-indigo-700">{baht(p.price)}</p>
          <p className={`mt-2 text-sm ${soldOut ? 'text-red-500' : 'text-emerald-600'}`}>
            {soldOut ? 'สินค้าหมด' : `มีสินค้า ${p.stock} ชิ้น`}
          </p>
          <div className="mt-6 flex items-center gap-3">
            {isLoggedIn && !soldOut && (
              <select aria-label="จำนวน" value={qty} onChange={(e) => setQty(Number(e.target.value))}
                      className="rounded-lg border border-slate-300 px-3 py-3">
                {Array.from({ length: Math.min(p.stock, 10) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            )}
            <button onClick={handleAddToCart} disabled={soldOut || busy} className={`${btnPrimary} px-6 py-3`}>
              {isLoggedIn ? (busy ? 'กำลังเพิ่ม...' : 'ใส่ตะกร้า') : 'เข้าสู่ระบบเพื่อสั่งซื้อ'}
            </button>
          </div>
          {msg && (
            <p role="status" className={`mt-3 text-sm ${msg.ok ? 'text-emerald-600' : 'text-red-600'}`}>
              {msg.text} {msg.ok && <Link to="/cart" className="underline">ไปที่ตะกร้า</Link>}
            </p>
          )}
          {p.description && <p className="mt-8 whitespace-pre-line leading-relaxed text-slate-600">{p.description}</p>}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
