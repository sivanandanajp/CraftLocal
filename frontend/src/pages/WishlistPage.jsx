import { Link } from 'react-router-dom';

export default function WishlistPage() {
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

      <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
        <p className="text-lg font-semibold text-on-surface">No saved items yet</p>
        <p className="mt-2 text-sm text-on-surface-variant">Save your favorite handcrafted pieces to come back later.</p>
      </div>
    </div>
  );
}
