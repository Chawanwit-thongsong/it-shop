import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as api from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
import { useApi } from '../../hooks/useApi';
import { ErrorBox, Loading, btnGhost, btnPrimary, inputClass } from '../../components/States';

const blank = { name: '', categoryId: '', brand: '', price: '', stock: '', imageUrl: '', description: '', isActive: true };

// ใช้ฟอร์มเดียวทั้งเพิ่ม (/admin/products/new) และแก้ (/admin/products/:id)
function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const cats = useApi(useCallback(() => api.getCategories(), []));
  const current = useApi(useCallback(
    () => (isEdit ? api.getAdminProduct(id, token) : Promise.resolve(null)),
    [isEdit, id, token],
  ));

  useEffect(() => {
    if (!current.data) return;
    const p = current.data;
    setForm({
      name: p.name, categoryId: String(p.categoryId), brand: p.brand ?? '', price: String(p.price),
      stock: String(p.stock), imageUrl: p.imageUrl ?? '', description: p.description ?? '', isActive: p.isActive,
    });
  }, [current.data]);

  const set = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError('ต้องมีชื่อสินค้า');
    if (!form.categoryId) return setError('ต้องเลือกหมวด');
    if (form.price === '' || Number(form.price) < 0) return setError('ราคาไม่ถูกต้อง');
    if (form.stock === '' || Number(form.stock) < 0) return setError('สต็อกไม่ถูกต้อง');

    const body = { ...form, categoryId: Number(form.categoryId), price: Number(form.price), stock: Number(form.stock) };
    setBusy(true);
    setError('');
    try {
      if (isEdit) await api.updateProduct(id, body, token);
      else await api.createProduct(body, token);
      navigate('/admin/products');
    } catch (err) {
      setError(err.message); // ข้อความ validate จาก Go เช่น ลิงก์รูปต้องขึ้นต้นด้วย https://
    } finally {
      setBusy(false);
    }
  }

  if (current.loading || cats.loading) return <Loading />;
  if (current.error || cats.error) {
    return <ErrorBox error={current.error || cats.error} onRetry={current.error ? current.reload : cats.reload} />;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">{isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h1>
      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4 rounded-plate border border-line bg-surface p-6 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-sm text-muted">ชื่อสินค้า *</span>
          <input value={form.name} onChange={set('name')} className={`${inputClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-sm text-muted">หมวด *</span>
          <select value={form.categoryId} onChange={set('categoryId')} className={`${inputClass} mt-1`}>
            <option value="">เลือกหมวด</option>
            {cats.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-muted">แบรนด์</span>
          <input value={form.brand} onChange={set('brand')} className={`${inputClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-sm text-muted">ราคา (บาท) *</span>
          <input type="number" min="0" value={form.price} onChange={set('price')} className={`${inputClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-sm text-muted">สต็อก *</span>
          <input type="number" min="0" value={form.stock} onChange={set('stock')} className={`${inputClass} mt-1`} />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm text-muted">ลิงก์รูป (https://...)</span>
          <input value={form.imageUrl} onChange={set('imageUrl')} className={`${inputClass} mt-1`} />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm text-muted">รายละเอียด</span>
          <textarea rows={4} value={form.description} onChange={set('description')} className={`${inputClass} mt-1`} />
        </label>
        <label className="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
          <span className="text-sm text-muted">เปิดขาย (แสดงในหน้าร้าน)</span>
        </label>
        {error && <p role="alert" className="text-sm text-red-700 md:col-span-2">{error}</p>}
        <div className="flex gap-2 md:col-span-2">
          <button disabled={busy} className={btnPrimary}>{busy ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          <Link to="/admin/products" className={btnGhost}>ยกเลิก</Link>
        </div>
      </form>
    </div>
  );
}

export default AdminProductForm;
