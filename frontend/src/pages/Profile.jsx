import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { useApi } from '../hooks/useApi';
import { ErrorBox, Loading, btnPrimary, inputClass } from '../components/States';

// หน้าโปรไฟล์: ดึงข้อมูลล่าสุดจาก /api/me แก้ข้อมูลส่วนตัว และเปลี่ยนรหัสผ่าน
function Profile() {
  const { token, saveMember } = useAuth();
  const me = useApi(useCallback(() => api.getMe(token), [token]));

  if (me.loading) return <Loading />;
  if (me.error) {
    return <div className="mx-auto max-w-xl px-4 py-10"><ErrorBox error={me.error} onRetry={me.reload} /></div>;
  }
  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-10">
      <h1 className="text-2xl font-semibold">โปรไฟล์ของฉัน</h1>
      <ProfileForm member={me.data} token={token} onSaved={saveMember} />
      <PasswordForm token={token} />
    </div>
  );
}

function ProfileForm({ member, token, onSaved }) {
  const [form, setForm] = useState({ displayName: '', phone: '', address: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm({ displayName: member.displayName, phone: member.phone ?? '', address: member.address ?? '' });
  }, [member]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.displayName.trim()) return setMsg({ ok: false, text: 'ต้องมีชื่อ' });
    setBusy(true);
    try {
      const updated = await api.updateMe(form, token);
      onSaved(updated); // อัปเดตชื่อบน Navbar ด้วย
      setMsg({ ok: true, text: 'บันทึกแล้ว' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="font-semibold">ข้อมูลส่วนตัว</h2>
      <p className="text-sm text-slate-500">อีเมล: {member.email}</p>
      <label className="block">
        <span className="text-sm text-slate-600">ชื่อที่แสดง</span>
        <input value={form.displayName} onChange={set('displayName')} className={`${inputClass} mt-1`} />
      </label>
      <label className="block">
        <span className="text-sm text-slate-600">เบอร์โทร</span>
        <input value={form.phone} onChange={set('phone')} className={`${inputClass} mt-1`} />
      </label>
      <label className="block">
        <span className="text-sm text-slate-600">ที่อยู่จัดส่ง</span>
        <textarea rows={3} value={form.address} onChange={set('address')} className={`${inputClass} mt-1`} />
      </label>
      {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</p>}
      <button disabled={busy} className={btnPrimary}>{busy ? 'กำลังบันทึก...' : 'บันทึก'}</button>
    </form>
  );
}

function PasswordForm({ token }) {
  const empty = { current: '', next: '', confirm: '' };
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.next.length < 8) return setMsg({ ok: false, text: 'รหัสผ่านใหม่ต้องยาว 8 ตัวอักษรขึ้นไป' });
    if (form.next !== form.confirm) return setMsg({ ok: false, text: 'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน' });
    setBusy(true);
    try {
      await api.changePassword(form.current, form.next, token);
      setForm(empty);
      setMsg({ ok: true, text: 'เปลี่ยนรหัสผ่านแล้ว' });
    } catch (err) {
      setMsg({ ok: false, text: err.message }); // เช่น รหัสผ่านเดิมไม่ถูกต้อง
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="font-semibold">เปลี่ยนรหัสผ่าน</h2>
      <label className="block">
        <span className="text-sm text-slate-600">รหัสผ่านเดิม</span>
        <input type="password" value={form.current} onChange={set('current')} autoComplete="current-password" className={`${inputClass} mt-1`} />
      </label>
      <label className="block">
        <span className="text-sm text-slate-600">รหัสผ่านใหม่</span>
        <input type="password" value={form.next} onChange={set('next')} autoComplete="new-password" className={`${inputClass} mt-1`} />
      </label>
      <label className="block">
        <span className="text-sm text-slate-600">ยืนยันรหัสผ่านใหม่</span>
        <input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" className={`${inputClass} mt-1`} />
      </label>
      {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</p>}
      <button disabled={busy} className={btnPrimary}>{busy ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}</button>
    </form>
  );
}

export default Profile;
