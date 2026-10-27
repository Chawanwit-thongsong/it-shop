// แปลงตัวเลขเป็นราคาไทย เช่น 12990 -> "฿12,990"
export function baht(n) {
  return '฿' + Number(n ?? 0).toLocaleString('th-TH');
}
