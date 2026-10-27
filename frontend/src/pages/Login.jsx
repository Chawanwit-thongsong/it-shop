import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { btnPrimary, inputClass } from '../components/States';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    // ตรวจเบื้องต้นฝั่งหน้าเว็บ (Go ตรวจซ้ำอีกชั้น)
    if (!email.trim() || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate(location.state?.from ?? '/', { replace: true }); // กลับไปหน้าที่ตั้งใจจะเข้า
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">เข้าสู่ระบบ</h1>
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm text-muted">อีเมล</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 autoComplete="email" className={`${inputClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-sm text-muted">รหัสผ่าน</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 autoComplete="current-password" className={`${inputClass} mt-1`} />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-2.5`}>
          {busy ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        ยังไม่มีบัญชี? <Link to="/register" className="text-accent hover:underline">สมัครสมาชิก</Link>
      </p>
    </div>
  );
}

export default Login;
