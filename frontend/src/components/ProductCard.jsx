import { Link } from 'react-router-dom';
import { baht } from '../utils/format';

// การ์ดสินค้าแบบร้านไอที: รูปบนพื้นเทาเย็น ไม่มีกรอบ/เงา ให้รูปสินค้าเป็นพระเอก
function ProductCard({ product }) {
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 5;
  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-plate bg-plate transition-colors group-hover:bg-line/70">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy"
               className={`h-full w-full object-contain p-6 mix-blend-multiply ${soldOut ? 'opacity-40' : ''}`} />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted">ไม่มีรูป</div>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-md bg-ink px-2 py-1 text-xs font-medium text-surface">สินค้าหมด</span>
        )}
      </div>
      <div className="px-1 pt-3">
        {product.brand && <p className="text-xs text-muted">{product.brand}</p>}
        <h3 className="mt-0.5 line-clamp-2 text-[15px] leading-snug text-ink group-hover:underline group-hover:decoration-line group-hover:underline-offset-4">
          {product.name}
        </h3>
        <p className="mt-2 text-base font-semibold text-ink">{baht(product.price)}</p>
        {lowStock && <p className="mt-0.5 text-xs text-amber-700">เหลือ {product.stock} ชิ้น</p>}
      </div>
    </Link>
  );
}

export default ProductCard;
