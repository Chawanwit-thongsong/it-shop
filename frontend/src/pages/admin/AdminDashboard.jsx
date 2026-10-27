import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
import { useApi } from '../../hooks/useApi';
import StatusBadge from '../../components/StatusBadge';
import { Empty, ErrorBox, Loading } from '../../components/States';
import { ORDER_STATUS, baht } from '../../utils/format';

function Card({ label, value, to }) {
  const body = (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
  return to ? <Link to={to} className="block hover:opacity-80">{body}</Link> : body;
}

function AdminDashboard() {
  const { token } = useAuth();
  const stats = useApi(useCallback(() => api.getAdminStats(token), [token]));

  if (stats.loading) return <Loading />;
  if (stats.error) return <ErrorBox error={stats.error} onRetry={stats.reload} />;

  const s = stats.data;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card label="ยอดขาย (ชำระแล้ว)" value={baht(s.revenue)} />
        <Card label="ออเดอร์ทั้งหมด" value={s.orders} to="/admin/orders" />
        <Card label="สินค้าที่เปิดขาย" value={`${s.activeProducts} / ${s.products}`} to="/admin/products" />
        <Card label="สมาชิก" value={s.members} to="/admin/members" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(ORDER_STATUS).map(([key, { label }]) => (
          <Link key={key} to={`/admin/orders?status=${key}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm hover:border-indigo-300">
            {label}: <b>{s.ordersByStatus[key] ?? 0}</b>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold">ออเดอร์ล่าสุด</h2>
          {s.recentOrders.length === 0 ? (
            <Empty title="ยังไม่มีออเดอร์" />
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white text-sm">
              {s.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link to={`/admin/orders/${o.id}`} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                    <span className="font-medium">#{o.id}</span>
                    <span className="text-slate-500">{o.memberName}</span>
                    <StatusBadge status={o.status} />
                    <span className="ml-auto">{baht(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="mb-3 font-semibold">สินค้าใกล้หมด (≤ 5 ชิ้น)</h2>
          {s.lowStock.length === 0 ? (
            <Empty title="สต็อกยังพอทุกชิ้น" />
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white text-sm">
              {s.lowStock.map((p) => (
                <li key={p.id}>
                  <Link to={`/admin/products/${p.id}`} className="flex justify-between p-3 hover:bg-slate-50">
                    <span>{p.name}</span>
                    <span className="font-medium text-red-600">{p.stock} ชิ้น</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
