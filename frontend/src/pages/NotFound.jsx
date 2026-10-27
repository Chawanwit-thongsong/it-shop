import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="px-4 py-24 text-center">
      <p className="text-6xl font-semibold text-slate-200">404</p>
      <p className="mt-2 text-muted">ไม่พบหน้าที่ต้องการ</p>
      <Link to="/" className="mt-4 inline-block text-accent hover:underline">กลับหน้าแรก</Link>
    </div>
  );
}

export default NotFound;
