import { useCallback, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import * as api from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { useApi } from '../hooks/useApi';
import OrderView from '../components/OrderView';
import { ConfirmBox, ErrorBox, Loading, btnDanger } from '../components/States';

function OrderDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const location = useLocation();
  const order = useApi(useCallback(() => api.getMyOrder(id, token), [id, token]));
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function cancel() {
    setBusy(true);
    setError('');
    try {
      order.setData(await api.cancelMyOrder(id, token));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  }

  if (order.loading) return <Loading />;
  if (order.error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorBox error={order.error} onRetry={order.error.status === 404 ? null : order.reload} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/orders" className="text-sm text-slate-500 hover:text-indigo-600">← ออเดอร์ของฉัน</Link>
      {location.state?.justOrdered && (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">สั่งซื้อสำเร็จ ขอบคุณที่ใช้บริการ</p>
      )}
      <div className="mt-4"><OrderView order={order.data} /></div>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      {order.data.status === 'pending' && (
        <button onClick={() => setConfirm(true)} className={`${btnDanger} mt-6`}>ยกเลิกออเดอร์</button>
      )}
      <ConfirmBox open={confirm} title="ยกเลิกออเดอร์นี้?" confirmText="ยกเลิกออเดอร์" busy={busy}
                  onConfirm={cancel} onCancel={() => setConfirm(false)}>
        สินค้าจะถูกคืนเข้าสต็อก และย้อนกลับไม่ได้
      </ConfirmBox>
    </div>
  );
}

export default OrderDetail;
