import { Link } from 'react-router-dom';
import { baht } from '../utils/format';

function ProductCard({ product }) {
  const soldOut = product.stock <= 0;
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-md"
    >
      <div className="aspect-square bg-slate-50">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy"
               className="h-full w-full object-contain p-4 transition group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-slate-300">ไม่มีรูป</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs text-slate-400">{product.categoryName}{product.brand && ` · ${product.brand}`}</p>
        <h3 className="line-clamp-2 font-medium text-slate-800">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold text-indigo-700">{baht(product.price)}</span>
          {soldOut && <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">สินค้าหมด</span>}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
