// ชิ้นส่วนที่ทุกหน้าใช้ซ้ำ: สถานะ Loading / Empty / Error, กล่องยืนยัน และ class ของปุ่ม/ช่องกรอก

export function Loading({ text = 'กำลังโหลด...' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-20 text-sm text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
      <p>{text}</p>
    </div>
  );
}

export function Empty({ title = 'ยังไม่มีข้อมูล', children }) {
  return (
    <div className="rounded-plate bg-plate px-6 py-14 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div role="alert" className="rounded-plate border border-red-200 bg-red-50/60 px-6 py-8 text-center">
      <p className="font-medium text-red-800">โหลดข้อมูลไม่สำเร็จ</p>
      <p className="mt-1 text-sm text-red-700">{error?.message}</p>
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-plate bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className={btnGhost}>ยกเลิก</button>
          <button onClick={onConfirm} disabled={busy} className={btnDangerSolid}>
            {busy ? 'กำลังทำ...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export const btnPrimary =
  'inline-flex items-center justify-center rounded-[10px] bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted';
export const btnGhost =
  'inline-flex items-center justify-center rounded-[10px] border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/30 disabled:cursor-not-allowed disabled:text-muted';
export const btnDanger =
  'inline-flex items-center justify-center rounded-[10px] border border-line bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 disabled:text-muted';
const btnDangerSolid =
  'inline-flex items-center justify-center rounded-[10px] bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:bg-line';
export const inputClass =
  'w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-ink placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft';
