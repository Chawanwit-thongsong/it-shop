import { baht, dateTime } from '../utils/format';
import StatusBadge from './StatusBadge';

// แสดงรายละเอียดออเดอร์ ใช้ร่วมกันทั้งหน้าสมาชิกและหลังบ้าน
function OrderView({ order, showMember = false }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">ออเดอร์ #{order.id}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-muted">{dateTime(order.createdAt)}</span>
      </div>

      <div className="rounded-plate border border-line bg-white p-5 text-sm">
        <h2 className="mb-2 font-semibold">จัดส่งถึง</h2>
        {showMember && <p className="text-muted">สมาชิก: {order.memberName} ({order.memberEmail})</p>}
        <p>{order.shipName}, โทร {order.shipPhone}</p>
        <p className="whitespace-pre-line text-muted">{order.shipAddress}</p>
      </div>

      <ul className="divide-y divide-line rounded-plate border border-line bg-white">
        {order.items.map((it) => (
          <li key={it.productId} className="flex items-center gap-4 p-4">
            {it.imageUrl && <img src={it.imageUrl} alt="" className="h-12 w-12 rounded object-contain" />}
            <span className="flex-1">{it.name}</span>
            <span className="text-sm text-muted">{baht(it.unitPrice)} × {it.qty}</span>
            <span className="w-24 text-right font-medium">{baht(it.unitPrice * it.qty)}</span>
          </li>
        ))}
        <li className="flex justify-between p-4 font-semibold">
          <span>ยอดรวม</span>
          <span className="text-ink">{baht(order.total)}</span>
        </li>
      </ul>
    </div>
  );
}

export default OrderView;
