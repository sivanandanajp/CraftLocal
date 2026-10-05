import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Saved</p>
          <h1 className="mt-2 text-3xl font-bold text-on-surface">Wishlist</h1>
        </div>
        <Link to="/products" className="rounded-full border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface">
          Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="border-y border-outline-variant py-12 text-center">
          <p className="text-lg font-semibold text-on-surface">No saved items yet</p>
          <p className="mt-2 text-sm text-on-surface-variant">Save your favorite handcrafted pieces to come back later.</p>
        </div>
      ) : (
        <div className="divide-y divide-outline-variant border-y border-outline-variant">
          {items.map((item) => (
            <article key={item.id} className="flex flex-wrap items-center gap-4 py-5">
              <Link to={`/product/${item.id}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              </Link>
              <div className="min-w-40 flex-1">
                <h2 className="font-semibold text-on-surface">{item.title}</h2>
                <p className="text-sm text-on-surface-variant">By {item.vendor}</p>
                <p className="mt-1 font-semibold text-primary">${item.price.toFixed(2)}</p>
              </div>
              <button type="button" onClick={() => addItem(item)} className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary">
                Add to cart
              </button>
              <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.title} from wishlist`} className="p-2 text-on-surface-variant hover:text-error">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
