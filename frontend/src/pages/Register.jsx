import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { btnPrimary, inputClass } from '../components/States';
import AuthShell from '../components/AuthShell';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.displayName.trim() || !form.email.trim()) return setError('กรุณากรอกชื่อและอีเมล');
    if (form.password.length < 8) return setError('รหัสผ่านต้องยาว 8 ตัวอักษรขึ้นไป');
    if (form.password !== form.confirm) return setError('ยืนยันรหัสผ่านไม่ตรงกัน');

    setBusy(true);
    setError('');
    try {
      await register(form.email, form.password, form.displayName.trim());
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message); // เช่น 409 อีเมลนี้มีบัญชีอยู่แล้ว
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="สมัครสมาชิก"
               footer={<>มีบัญชีแล้ว? <Link to="/login" className="font-medium text-accent-dark underline-offset-4 hover:underline">เข้าสู่ระบบ</Link></>}>
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink">ชื่อที่แสดง</span>
          <input value={form.displayName} onChange={set('displayName')} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">อีเมล</span>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" className={`${inputClass} mt-1.5`} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink">รหัสผ่าน</span>
            <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" className={`${inputClass} mt-1.5`} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">ยืนยันรหัสผ่าน</span>
            <input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" className={`${inputClass} mt-1.5`} />
          </label>
        </div>
        <p className="text-xs text-muted">รหัสผ่านอย่างน้อย 8 ตัวอักษร</p>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-3 text-base`}>
          {busy ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>
      </form>
    </AuthShell>
  );
}

export default Register;
