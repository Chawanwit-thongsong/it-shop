import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="px-4 py-24 text-center">
      <p className="text-7xl font-semibold tracking-tight text-accent">404</p>
      <p className="mt-3 text-muted">ไม่พบหน้าที่ต้องการ ลิงก์อาจผิดหรือหน้านี้ถูกย้ายไปแล้ว</p>
      <Link to="/" className="mt-4 inline-block font-medium text-accent-dark underline-offset-4 hover:underline">กลับหน้าแรก</Link>
    </div>
  );
}

export default NotFound;
