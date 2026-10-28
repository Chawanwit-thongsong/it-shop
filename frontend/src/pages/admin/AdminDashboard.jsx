import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
import { useApi } from '../../hooks/useApi';
import StatusBadge from '../../components/StatusBadge';
import { Empty, ErrorBox, Loading } from '../../components/States';
import { ORDER_STATUS, baht } from '../../utils/format';

function Card({ label, value, to, dark = false }) {
  const body = (
    <div className={`h-full rounded-plate p-5 ${dark ? 'bg-night text-white ring-1 ring-white/10' : 'border border-line bg-surface'}`}>
      <p className={`text-sm ${dark ? 'text-white/60' : 'text-muted'}`}>{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${dark ? 'text-accent' : 'text-ink'}`}>{value}</p>
    </div>
  );
  return to ? <Link to={to} className="block transition-opacity hover:opacity-80">{body}</Link> : body;
}

function AdminDashboard() {
  const { token } = useAuth();
  const stats = useApi(useCallback(() => api.getAdminStats(token), [token]));

  if (stats.loading) return <Loading />;
  if (stats.error) return <ErrorBox error={stats.error} onRetry={stats.reload} />;

  const s = stats.data;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card label="ยอดขาย (ชำระแล้ว)" value={baht(s.revenue)} dark />
        <Card label="ออเดอร์ทั้งหมด" value={s.orders} to="/admin/orders" />
        <Card label="สินค้าที่เปิดขาย" value={`${s.activeProducts} / ${s.products}`} to="/admin/products" />
        <Card label="สมาชิก" value={s.members} to="/admin/members" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(ORDER_STATUS).map(([key, { label }]) => (
          <Link key={key} to={`/admin/orders?status=${key}`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-3 pr-1 text-sm transition-colors hover:border-ink/30">
            {label}
            <span className="min-w-[1.75rem] rounded-full bg-plate px-2 py-0.5 text-center text-xs font-semibold">{s.ordersByStatus[key] ?? 0}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold">ออเดอร์ล่าสุด</h2>
          {s.recentOrders.length === 0 ? (
            <Empty title="ยังไม่มีออเดอร์" />
          ) : (
            <ul className="divide-y divide-line rounded-plate border border-line bg-surface text-sm">
              {s.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link to={`/admin/orders/${o.id}`} className="flex items-center gap-3 p-3 hover:bg-plate">
                    <span className="font-medium">#{o.id}</span>
                    <span className="text-muted">{o.memberName}</span>
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
            <ul className="divide-y divide-line rounded-plate border border-line bg-surface text-sm">
              {s.lowStock.map((p) => (
                <li key={p.id}>
                  <Link to={`/admin/products/${p.id}`} className="flex justify-between p-3 hover:bg-plate">
                    <span>{p.name}</span>
                    <span className="font-medium text-red-700">{p.stock} ชิ้น</span>
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
