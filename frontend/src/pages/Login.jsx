import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { btnPrimary, inputClass } from '../components/States';
import AuthShell from '../components/AuthShell';

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
    <AuthShell title="เข้าสู่ระบบ"
               footer={<>ยังไม่มีบัญชี? <Link to="/register" className="font-medium text-accent-dark underline-offset-4 hover:underline">สมัครสมาชิก</Link></>}>
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink">อีเมล</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 autoComplete="email" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">รหัสผ่าน</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 autoComplete="current-password" className={`${inputClass} mt-1.5`} />
        </label>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-3 text-base`}>
          {busy ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </AuthShell>
  );
}

export default Login;
