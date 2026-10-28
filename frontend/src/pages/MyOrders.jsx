import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { useApi } from '../hooks/useApi';
import StatusBadge from '../components/StatusBadge';
import { Empty, ErrorBox, Loading } from '../components/States';
import { baht, dateTime } from '../utils/format';

function MyOrders() {
  const { token } = useAuth();
  const orders = useApi(useCallback(() => api.getMyOrders(token), [token]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">ออเดอร์ของฉัน</h1>
      <div className="mt-6">
        {orders.loading ? (
          <Loading />
        ) : orders.error ? (
          <ErrorBox error={orders.error} onRetry={orders.reload} />
        ) : orders.data.length === 0 ? (
          <Empty title="ยังไม่มีออเดอร์">
            <Link to="/products" className="font-medium text-accent-dark underline-offset-4 hover:underline">ไปเลือกสินค้า</Link>
          </Empty>
        ) : (
          <ul className="space-y-3">
            {orders.data.map((o) => (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`}
                      className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-plate border border-line bg-surface p-5 transition-colors hover:border-ink/30">
                  <span className="text-lg font-semibold">#{o.id}</span>
                  <span className="text-sm text-muted">{dateTime(o.createdAt)}</span>
                  <span className="text-sm text-muted">{o.itemCount} ชิ้น</span>
                  <StatusBadge status={o.status} />
                  <span className="ml-auto text-lg font-semibold text-ink">{baht(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
