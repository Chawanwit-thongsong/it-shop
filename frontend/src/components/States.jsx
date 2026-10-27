// ชิ้นส่วนที่ทุกหน้าใช้ซ้ำ: สถานะ Loading / Empty / Error, กล่องยืนยัน และ class ของปุ่ม/ช่องกรอก

export function Loading({ text = 'กำลังโหลด...' }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-slate-400">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
      <p>{text}</p>
    </div>
  );
}

export function Empty({ title = 'ยังไม่มีข้อมูล', children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="font-medium text-slate-600">{title}</p>
      {children && <div className="mt-2 text-sm text-slate-400">{children}</div>}
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-700">โหลดข้อมูลไม่สำเร็จ</p>
      <p className="mt-1 text-sm text-red-500">{error?.message}</p>
      {onRetry && (
        <button onClick={onRetry} className={`${btnGhost} mt-4`}>
          ลองใหม่
        </button>
      )}
    </div>
  );
}

// กล่องยืนยันก่อนทำสิ่งที่ย้อนกลับยาก (ลบ, ยกเลิกออเดอร์)
export function ConfirmBox({ open, title, children, confirmText = 'ยืนยัน', busy, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <div className="mt-2 text-sm text-slate-600">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className={btnGhost}>ยกเลิก</button>
          <button onClick={onConfirm} disabled={busy} className={btnDanger}>
            {busy ? 'กำลังทำ...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export const btnPrimary =
  'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300';
export const btnGhost =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:text-slate-300';
export const btnDanger =
  'rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:text-slate-300';
export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100';
