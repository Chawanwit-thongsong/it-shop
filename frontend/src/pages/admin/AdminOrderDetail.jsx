import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as api from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
import { useApi } from '../../hooks/useApi';
import OrderView from '../../components/OrderView';
import { ErrorBox, Loading } from '../../components/States';

function AdminOrderDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const order = useApi(useCallback(() => api.getAdminOrder(id, token), [id, token]));

  if (order.loading) return <Loading />;
  if (order.error) return <ErrorBox error={order.error} onRetry={order.reload} />;
  return (
    <div>
      <Link to="/admin/orders" className="text-sm text-slate-500 hover:text-indigo-600">← ออเดอร์ทั้งหมด</Link>
      <div className="mt-4"><OrderView order={order.data} showMember /></div>
    </div>
  );
}

export default AdminOrderDetail;
