import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { btnPrimary, inputClass } from '../components/States';

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
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">สมัครสมาชิก</h1>
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm text-slate-600">ชื่อที่แสดง</span>
          <input value={form.displayName} onChange={set('displayName')} className={`${inputClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">อีเมล</span>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" className={`${inputClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">รหัสผ่าน (อย่างน้อย 8 ตัว)</span>
          <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" className={`${inputClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">ยืนยันรหัสผ่าน</span>
          <input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" className={`${inputClass} mt-1`} />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-2.5`}>
          {busy ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        มีบัญชีแล้ว? <Link to="/login" className="text-indigo-600 hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}

export default Register;
