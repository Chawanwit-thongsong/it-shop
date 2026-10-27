import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api/backend';
import { useApi } from '../hooks/useApi';
import ProductCard from '../components/ProductCard';
import { Empty, ErrorBox, Loading } from '../components/States';

function Home() {
  // สินค้าใหม่ล่าสุด 8 ชิ้น + หมวดทั้งหมด (ข้อมูลจาก Go -> Supabase)
  const latest = useApi(useCallback(() => api.getProducts({ limit: 8 }), []));
  const cats = useApi(useCallback(() => api.getCategories(), []));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 px-8 py-14 text-white">
        <h1 className="text-3xl font-semibold md:text-4xl">อุปกรณ์ไอทีครบ จบในที่เดียว</h1>
        <p className="mt-2 text-indigo-100">โน้ตบุ๊ก สมาร์ตโฟน แท็บเล็ต และอุปกรณ์เสริม</p>
        <Link to="/products" className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 font-medium text-indigo-700">
          ดูสินค้าทั้งหมด
        </Link>
      </section>

      {cats.data?.length > 0 && (
        <section className="mt-8 flex flex-wrap gap-2">
          {cats.data.map((c) => (
            <Link key={c.id} to={`/products?category=${c.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:border-indigo-300">
              {c.name}
            </Link>
          ))}
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">สินค้ามาใหม่</h2>
        {latest.loading ? (
          <Loading />
        ) : latest.error ? (
          <ErrorBox error={latest.error} onRetry={latest.reload} />
        ) : latest.data.items.length === 0 ? (
          <Empty title="ยังไม่มีสินค้า" />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {latest.data.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
