import { btnGhost } from './States';

// ปุ่มเปลี่ยนหน้า: ไม่แสดงถ้ามีหน้าเดียว
function Pagination({ page, limit, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-3 text-sm">
      <button className={btnGhost} disabled={page <= 1} onClick={() => onChange(page - 1)}>ก่อนหน้า</button>
      <span className="text-slate-500">หน้า {page} / {pages}</span>
      <button className={btnGhost} disabled={page >= pages} onClick={() => onChange(page + 1)}>ถัดไป</button>
    </div>
  );
}

export default Pagination;
