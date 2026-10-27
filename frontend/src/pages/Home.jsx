import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api/backend';
import { useApi } from '../hooks/useApi';
import ProductCard from '../components/ProductCard';
import { Empty, ErrorBox, Loading } from '../components/States';

function Home() {
  // ดึงสินค้าทั้งร้านครั้งเดียว (ร้านเล็ก ไม่เกิน 100 ชิ้น) ใช้ทั้งผนังหมวดและสินค้าเข้าใหม่
  const all = useApi(useCallback(() => api.getProducts({ limit: 100 }), []));
  const cats = useApi(useCallback(() => api.getCategories(), []));

  // หมวดละ 1 รูปตัวแทน + จำนวนสินค้า
  const wall = useMemo(() => {
    if (!cats.data || !all.data) return [];
    return cats.data.map((c) => {
      const items = all.data.items.filter((p) => p.categorySlug === c.slug);
      // รายการเรียงใหม่สุดก่อน ใช้ชิ้นแรกของหมวดตามลำดับ seed (id น้อยสุด) เป็นรูปปก
      const cover = [...items].reverse().find((p) => p.imageUrl && p.stock > 0) ?? items[0];
      return { ...c, count: items.length, image: cover?.imageUrl };
    });
  }, [cats.data, all.data]);

  const loading = all.loading || cats.loading;
  const error = all.error || cats.error;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid gap-6 pb-10 pt-12 md:grid-cols-[1.15fr_1fr] md:items-end md:pt-16">
        <h1 className="max-w-xl text-4xl font-semibold leading-[1.15] tracking-tight text-ink md:text-5xl md:leading-[1.12]">
          โน้ตบุ๊ก มือถือ แท็บเล็ต และอุปกรณ์เสริม ของแท้ พร้อมส่ง
        </h1>
        <p className="max-w-md text-base leading-relaxed text-muted md:justify-self-end">
          เลือกตามหมวดด้านล่าง หรือพิมพ์ชื่อรุ่นในช่องค้นหา สมัครสมาชิกแล้วสั่งได้ทันที และติดตามสถานะได้ในหน้าออเดอร์
        </p>
      </section>

      {/* ผนังหมวดสินค้า: จุดเด่นของหน้าแรก ใช้รูปสินค้าจริงจากแต่ละหมวด */}
      <section aria-label="เลือกตามหมวด">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorBox error={error} onRetry={() => { all.reload(); cats.reload(); }} />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {wall.map((c, i) => (
              <Link key={c.id} to={`/products?category=${c.slug}`}
                    className={`group flex flex-col justify-between overflow-hidden rounded-plate bg-plate p-5 transition-colors hover:bg-line/70 ${i === 0 ? 'col-span-2 md:col-span-1 md:row-span-2' : ''}`}>
                <div>
                  <h2 className="text-lg font-semibold text-ink md:text-xl">{c.name}</h2>
                  <p className="text-sm text-muted">{c.count} รายการ</p>
                </div>
                {c.image && (
                  <img src={c.image} alt="" loading="lazy"
                       className={`mt-4 w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:-translate-y-1 ${i === 0 ? 'aspect-[4/3] md:aspect-[3/4]' : 'aspect-[4/3]'}`} />
                )}
              </Link>
            ))}
            <Link to="/products"
                  className="col-span-2 flex items-center justify-between rounded-plate bg-ink px-5 py-6 text-white transition-colors hover:bg-accent-dark md:col-span-3">
              <span className="text-lg font-semibold">ดูสินค้าทั้งหมด</span>
              <span className="text-sm text-white/70">{all.data.total} รายการ</span>
            </Link>
          </div>
        )}
      </section>

      <section className="py-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">เข้าใหม่</h2>
          <Link to="/products" className="text-sm font-medium text-accent hover:underline">ดูทั้งหมด</Link>
        </div>
        {loading ? (
          <Loading />
        ) : error ? null : all.data.items.length === 0 ? (
          <Empty title="ยังไม่มีสินค้าในร้าน">ผู้ดูแลระบบเพิ่มสินค้าได้จากหน้าหลังบ้าน</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {all.data.items.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
