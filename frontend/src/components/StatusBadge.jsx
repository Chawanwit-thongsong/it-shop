import { ORDER_STATUS } from '../utils/format';

function StatusBadge({ status }) {
  const s = ORDER_STATUS[status] ?? { label: status, className: 'bg-slate-100 text-slate-500' };
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${s.className}`}>{s.label}</span>;
}

export default StatusBadge;
