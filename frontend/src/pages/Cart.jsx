import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { useApi } from '../hooks/useApi';
import { Empty, ErrorBox, Loading, btnPrimary, inputClass } from '../components/States';
import { baht } from '../utils/format';

// หน้าตะกร้า + ฟอร์มที่อยู่จัดส่ง (checkout) อยู่หน้าเดียวกัน
function Cart() {
  const { token, member } = useAuth();
  const navigate = useNavigate();
  const cart = useApi(useCallback(() => api.getCart(token), [token]));
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  // ทุก action ของตะกร้า Go ตอบตะกร้าล่าสุดกลับมา เอามาแทนของเดิมได้เลย
  async function run(productId, action) {
    setBusyId(productId);
    setError('');
    try {
      cart.setData(await action());
    } catch (err) {
      setError(err.message); // เช่น จำนวนเกินสต็อกที่มี
    } finally {
      setBusyId(null);
    }
  }

  if (cart.loading) return <Loading />;
  if (cart.error) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorBox error={cart.error} onRetry={cart.reload} /></div>;

  const { items, total } = cart.data;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">ตะกร้าสินค้า</h1>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {items.length === 0 ? (
        <div className="mt-6">
          <Empty title="ตะกร้ายังว่างอยู่">
            <Link to="/products" className="font-medium text-accent-dark underline-offset-4 hover:underline">ไปเลือกสินค้า</Link>
          </Empty>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-line rounded-plate border border-line bg-surface">
            {items.map((it) => (
              <li key={it.productId} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
                <div className="h-20 w-20 shrink-0 rounded-lg bg-plate">
                  {it.imageUrl && <img src={it.imageUrl} alt="" className="h-full w-full object-contain p-2 mix-blend-multiply" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${it.productId}`} className="font-medium leading-snug hover:underline">{it.name}</Link>
                  <p className="mt-0.5 text-sm text-muted">{baht(it.price)} ต่อชิ้น</p>
                  {(!it.isActive || it.qty > it.stock) && (
                    <p className="mt-1 text-xs font-medium text-red-700">{it.isActive ? `เหลือเพียง ${it.stock} ชิ้น` : 'สินค้าปิดการขายแล้ว'}</p>
                  )}
                </div>
                <label className="sr-only" htmlFor={`qty-${it.productId}`}>จำนวน {it.name}</label>
                <select id={`qty-${it.productId}`} value={it.qty} disabled={busyId === it.productId}
                        onChange={(e) => run(it.productId, () => api.setCartQty(it.productId, Number(e.target.value), token))}
                        className="rounded-lg border border-line bg-surface px-2 py-1.5">
                  {Array.from({ length: Math.max(it.qty, Math.min(it.stock, 10)) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <p className="w-24 text-right font-semibold">{baht(it.subtotal)}</p>
                <button onClick={() => run(it.productId, () => api.removeFromCart(it.productId, token))}
                        disabled={busyId === it.productId} aria-label={`ลบ ${it.name}`}
                        className="text-sm text-muted underline-offset-4 hover:text-red-700 hover:underline">ลบ</button>
              </li>
            ))}
          </ul>

          <CheckoutForm total={total} member={member} token={token}
                        onDone={(order) => navigate(`/orders/${order.id}`, { state: { justOrdered: true } })} />
        </div>
      )}
    </div>
  );
}

function CheckoutForm({ total, member, token, onDone }) {
  const [form, setForm] = useState({
    shipName: member?.displayName ?? '', shipPhone: member?.phone ?? '', shipAddress: member?.address ?? '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.shipName.trim() || !form.shipPhone.trim() || !form.shipAddress.trim()) {
      return setError('กรุณากรอกข้อมูลจัดส่งให้ครบ');
    }
    setBusy(true);
    setError('');
    try {
      onDone(await api.checkout(form, token));
    } catch (err) {
      setError(err.message); // เช่น สินค้า X มีไม่พอ
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="h-fit space-y-3 rounded-plate bg-plate p-5 md:sticky md:top-36">
      <h2 className="font-semibold">ที่อยู่จัดส่ง</h2>
      <input aria-label="ชื่อผู้รับ" placeholder="ชื่อผู้รับ" value={form.shipName} onChange={set('shipName')} className={inputClass} />
      <input aria-label="เบอร์โทร" placeholder="เบอร์โทร" value={form.shipPhone} onChange={set('shipPhone')} className={inputClass} />
      <textarea aria-label="ที่อยู่" placeholder="ที่อยู่" rows={3} value={form.shipAddress} onChange={set('shipAddress')} className={inputClass} />
      <div className="flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-sm text-muted">ยอดรวม</span>
        <span data-testid="cart-total" className="text-2xl font-semibold text-ink">{baht(total)}</span>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy} className={`${btnPrimary} w-full py-3 text-base`}>{busy ? 'กำลังสั่งซื้อ...' : 'ยืนยันสั่งซื้อ'}</button>
    </form>
  );
}

export default Cart;
