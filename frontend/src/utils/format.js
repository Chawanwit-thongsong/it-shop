// แปลงตัวเลขเป็นราคาไทย เช่น 12990 -> "฿12,990"
export function baht(n) {
  return '฿' + Number(n ?? 0).toLocaleString('th-TH');
}

export function dateTime(iso) {
  return new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
}

// ชื่อสถานะออเดอร์ภาษาไทย + สีป้าย
export const ORDER_STATUS = {
  pending: { label: 'รอชำระเงิน', className: 'bg-amber-50 text-amber-800' },
  paid: { label: 'ชำระแล้ว', className: 'bg-accent-soft text-accent-dark' },
  shipped: { label: 'กำลังจัดส่ง', className: 'bg-sky-50 text-sky-800' },
  done: { label: 'สำเร็จ', className: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'ยกเลิก', className: 'bg-plate text-muted' },
};
