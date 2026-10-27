import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as api from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
import { useApi } from '../../hooks/useApi';
import Pagination from '../../components/Pagination';
import { ConfirmBox, Empty, ErrorBox, Loading, btnDanger, btnGhost, btnPrimary, inputClass } from '../../components/States';
import { baht } from '../../utils/format';

const LIMIT = 20;

function AdminProducts() {
  const { token } = useAuth();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const page = Number(params.get('page')) || 1;
  const [text, setText] = useState(q);
  const [target, setTarget] = useState(null); // สินค้าที่กำลังจะลบ
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const list = useApi(useCallback(() => api.getAdminProducts({ q, page, limit: LIMIT }, token), [q, page, token]));

  async function confirmDelete() {
    setBusy(true);
    setActionError('');
    try {
      await api.deleteProduct(target.id, token);
      setTarget(null);
      list.reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">จัดการสินค้า</h1>
        <Link to="/admin/products/new" className={btnPrimary}>+ เพิ่มสินค้า</Link>
      </div>

      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); setParams(text.trim() ? { q: text.trim() } : {}); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="ค้นหาสินค้า" className={inputClass} />
        <button className={btnGhost}>ค้นหา</button>
      </form>

      {actionError && <p role="alert" className="mt-4 text-sm text-red-600">{actionError}</p>}

      <div className="mt-6">
        {list.loading ? (
          <Loading />
        ) : list.error ? (
          <ErrorBox error={list.error} onRetry={list.reload} />
        ) : list.data.items.length === 0 ? (
          <Empty title="ไม่พบสินค้า" />
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-3">สินค้า</th>
                    <th className="p-3">หมวด</th>
                    <th className="p-3 text-right">ราคา</th>
                    <th className="p-3 text-right">สต็อก</th>
                    <th className="p-3">สถานะ</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {list.data.items.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl && <img src={p.imageUrl} alt="" className="h-10 w-10 rounded object-contain" />}
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500">{p.categoryName}</td>
                      <td className="p-3 text-right">{baht(p.price)}</td>
                      <td className={`p-3 text-right ${p.stock <= 5 ? 'text-red-600' : ''}`}>{p.stock}</td>
                      <td className="p-3">
                        {p.isActive
                          ? <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">เปิดขาย</span>
                          : <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">ปิดขาย</span>}
                      </td>
                      <td className="whitespace-nowrap p-3 text-right">
                        <Link to={`/admin/products/${p.id}`} className={`${btnGhost} mr-2`}>แก้ไข</Link>
                        {p.isActive && <button onClick={() => setTarget(p)} className={btnDanger}>ปิดขาย</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} limit={LIMIT} total={list.data.total}
                        onChange={(n) => setParams({ ...(q && { q }), page: String(n) })} />
          </>
        )}
      </div>

      <ConfirmBox open={Boolean(target)} title="ปิดการขายสินค้านี้?" confirmText="ปิดขาย" busy={busy}
                  onConfirm={confirmDelete} onCancel={() => setTarget(null)}>
        "{target?.name}" จะไม่แสดงในหน้าร้าน แต่ออเดอร์เก่ายังเห็นอยู่ เปิดขายใหม่ได้จากหน้าแก้ไข
      </ConfirmBox>
    </div>
  );
}

export default AdminProducts;
