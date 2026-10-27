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
      <h1 className="text-2xl font-semibold">ออเดอร์ของฉัน</h1>
      <div className="mt-6">
        {orders.loading ? (
          <Loading />
        ) : orders.error ? (
          <ErrorBox error={orders.error} onRetry={orders.reload} />
        ) : orders.data.length === 0 ? (
          <Empty title="ยังไม่มีออเดอร์">
            <Link to="/products" className="text-accent hover:underline">ไปเลือกสินค้า</Link>
          </Empty>
        ) : (
          <ul className="space-y-3">
            {orders.data.map((o) => (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`}
                      className="flex flex-wrap items-center gap-4 rounded-plate border border-line bg-white p-4 hover:border-accent">
                  <span className="font-medium">#{o.id}</span>
                  <span className="text-sm text-muted">{dateTime(o.createdAt)}</span>
                  <span className="text-sm text-muted">{o.itemCount} ชิ้น</span>
                  <StatusBadge status={o.status} />
                  <span className="ml-auto font-semibold text-accent-dark">{baht(o.total)}</span>
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
