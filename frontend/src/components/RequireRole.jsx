import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// ครอบหน้าที่ต้องเป็น role ที่กำหนด (ใช้กับหลังบ้าน) เป็นแค่ชั้นหน้าเว็บ ชั้นจริงคือ mw.RequireRole ใน Go
function RequireRole({ role, children }) {
  const { isLoggedIn, member } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (member?.role !== role) {
    return (
      <div className="px-4 py-24 text-center">
        <p className="text-5xl font-semibold text-muted">403</p>
        <p className="mt-2 text-muted">หน้านี้สำหรับ {role} เท่านั้น</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-accent-dark underline-offset-4 hover:underline">กลับหน้าแรก</Link>
      </div>
    );
  }
  return children;
}

export default RequireRole;
