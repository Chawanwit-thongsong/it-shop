import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '../api/backend';
import { useApi } from '../hooks/useApi';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { Empty, ErrorBox, Loading, btnPrimary, inputClass } from '../components/States';

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

  const currentCat = cats.data?.find((c) => c.slug === category);
  const sideLink = (active) =>
    `block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${active ? 'bg-ink font-medium text-surface' : 'text-muted hover:bg-plate hover:text-ink'}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{currentCat?.name ?? 'สินค้าทั้งหมด'}</h1>
          {q && <p className="mt-1 text-sm text-muted">ผลการค้นหา "{q}"</p>}
        </div>
        <form onSubmit={handleSearch} className="flex w-full gap-2 md:w-96" role="search">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="ค้นหาชื่อสินค้าหรือแบรนด์"
                 aria-label="ค้นหาสินค้า" className={inputClass} />
          <button className={btnPrimary}>ค้นหา</button>
        </form>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[200px_1fr]">
        <aside>
          {/* มือถือใช้ dropdown, จอใหญ่ใช้รายการด้านซ้าย */}
          <select value={category} onChange={(e) => update({ category: e.target.value })}
                  aria-label="หมวดสินค้า" className={`${inputClass} md:hidden`}>
            <option value="">ทุกหมวด</option>
            {cats.data?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <nav aria-label="กรองตามหมวด" className="hidden space-y-1 md:block">
            <button onClick={() => update({ category: '' })} className={sideLink(!category)}>ทุกหมวด</button>
            {cats.data?.map((c) => (
              <button key={c.id} onClick={() => update({ category: c.slug })} className={sideLink(category === c.slug)}>
                {c.name}
              </button>
            ))}
          </nav>
        </aside>

        <div>
          {list.loading ? (
            <Loading text="กำลังโหลดสินค้า..." />
          ) : list.error ? (
            <ErrorBox error={list.error} onRetry={list.reload} />
          ) : list.data.items.length === 0 ? (
            <Empty title="ไม่พบสินค้า">ลองเปลี่ยนคำค้นหรือเลือกหมวดอื่น</Empty>
          ) : (
            <>
              <p className="mb-5 text-sm text-muted">พบ {list.data.total} รายการ</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
                {list.data.items.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination page={page} limit={LIMIT} total={list.data.total}
                          onChange={(p) => setParams({ ...Object.fromEntries(params), page: String(p) })} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;
