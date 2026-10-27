import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '../api/backend';
import { useApi } from '../hooks/useApi';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { Empty, ErrorBox, Loading, inputClass } from '../components/States';

const LIMIT = 12;

function Products() {
  // เก็บคำค้น/หมวด/หน้า ไว้ใน URL (?q=&category=&page=) กด back หรือแชร์ลิงก์แล้วได้ผลเดิม
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const page = Number(params.get('page')) || 1;
  const [text, setText] = useState(q);

  useEffect(() => setText(q), [q]);

  const cats = useApi(useCallback(() => api.getCategories(), []));
  const list = useApi(useCallback(
    () => api.getProducts({ q, category, page, limit: LIMIT }),
    [q, category, page],
  ));

  // เปลี่ยนคำค้นหรือหมวดแล้วกลับไปหน้า 1 เสมอ (ไม่ใส่ page) และไม่ใส่ค่าว่างลง URL
  function update(next) {
    const merged = { q, category, ...next };
    setParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v)));
  }

  function handleSearch(e) {
    e.preventDefault();
    update({ q: text.trim() });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">สินค้าทั้งหมด</h1>

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2" role="search">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="ค้นหาชื่อสินค้าหรือแบรนด์"
                 aria-label="ค้นหาสินค้า" className={inputClass} />
          <button className="rounded-lg bg-indigo-600 px-4 text-sm text-white hover:bg-indigo-700">ค้นหา</button>
        </form>
        <select value={category} onChange={(e) => update({ category: e.target.value })}
                aria-label="หมวดสินค้า" className={`${inputClass} md:w-56`}>
          <option value="">ทุกหมวด</option>
          {cats.data?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      <div className="mt-8">
        {list.loading ? (
          <Loading text="กำลังโหลดสินค้า..." />
        ) : list.error ? (
          <ErrorBox error={list.error} onRetry={list.reload} />
        ) : list.data.items.length === 0 ? (
          <Empty title="ไม่พบสินค้า">ลองเปลี่ยนคำค้นหรือเลือกหมวดอื่น</Empty>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">พบ {list.data.total} รายการ</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {list.data.items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <Pagination page={page} limit={LIMIT} total={list.data.total}
                        onChange={(p) => setParams({ ...Object.fromEntries(params), page: String(p) })} />
          </>
        )}
      </div>
    </div>
  );
}

export default Products;
