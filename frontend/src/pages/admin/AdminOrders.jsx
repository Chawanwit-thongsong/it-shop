import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as api from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
import { useApi } from '../../hooks/useApi';
import StatusBadge from '../../components/StatusBadge';
import { Empty, ErrorBox, Loading, inputClass } from '../../components/States';
import { ORDER_STATUS, baht, dateTime } from '../../utils/format';

function AdminOrders() {
  const { token } = useAuth();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const list = useApi(useCallback(() => api.getAdminOrders(status, token), [status, token]));
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  async function changeStatus(order, next) {
    setBusyId(order.id);
    setError('');
    try {
      const updated = await api.setOrderStatus(order.id, next, token);
      list.setData({ ...list.data, items: list.data.items.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o)) });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">จัดการออเดอร์</h1>
        <select aria-label="กรองสถานะ" value={status} onChange={(e) => setParams(e.target.value ? { status: e.target.value } : {})}
                className={`${inputClass} w-48`}>
          <option value="">ทุกสถานะ</option>
          {Object.entries(ORDER_STATUS).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6">
        {list.loading ? (
          <Loading />
        ) : list.error ? (
          <ErrorBox error={list.error} onRetry={list.reload} />
        ) : list.data.items.length === 0 ? (
          <Empty title="ไม่มีออเดอร์" />
        ) : (
          <div className="overflow-x-auto rounded-plate border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-plate text-muted">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">วันที่</th>
                  <th className="p-3">ลูกค้า</th>
                  <th className="p-3 text-right">ยอด</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3">เปลี่ยนเป็น</th>
                </tr>
              </thead>
              <tbody>
                {list.data.items.map((o) => {
                  const next = list.data.transitions[o.status] ?? []; // สถานะถัดไปที่ Go อนุญาต
                  return (
                    <tr key={o.id} className="border-t border-line">
                      <td className="p-3"><Link to={`/admin/orders/${o.id}`} className="text-accent hover:underline">#{o.id}</Link></td>
                      <td className="p-3 text-muted">{dateTime(o.createdAt)}</td>
                      <td className="p-3">{o.memberName}</td>
                      <td className="p-3 text-right">{baht(o.total)}</td>
                      <td className="p-3"><StatusBadge status={o.status} /></td>
                      <td className="p-3">
                        {next.length === 0 ? (
                          <span className="text-slate-300">-</span>
                        ) : (
                          <select aria-label={`เปลี่ยนสถานะออเดอร์ ${o.id}`} value="" disabled={busyId === o.id}
                                  onChange={(e) => changeStatus(o, e.target.value)}
                                  className="rounded-lg border border-slate-300 px-2 py-1">
                            <option value="" disabled>เลือก...</option>
                            {next.map((s) => <option key={s} value={s}>{ORDER_STATUS[s].label}</option>)}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
