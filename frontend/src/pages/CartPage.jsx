import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const shipping = items.length > 0 ? 5 : 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Your cart</p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface">Shopping bag</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="border-y border-outline-variant py-10 text-center">
              <p className="text-on-surface-variant">Your cart is empty.</p>
              <Link to="/products" className="mt-4 inline-block font-semibold text-primary hover:underline">
                Browse handcrafted goods
              </Link>
            </div>
          ) : items.map((item) => (
            <article key={item.id} className="flex flex-wrap items-center gap-4 border-b border-outline-variant py-4">
              <img src={item.image} alt="" className="h-20 w-20 rounded-lg bg-surface-container object-cover" />
              <div className="min-w-36 flex-1">
                <h2 className="text-lg font-semibold text-on-surface">{item.title}</h2>
                <p className="text-sm text-on-surface-variant">By {item.vendor}</p>
                <p className="mt-1 text-sm font-medium text-primary">${item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2 border border-outline-variant rounded-lg bg-surface px-1">
                <button type="button" aria-label={`Decrease ${item.title} quantity`} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="w-7 text-center text-sm font-semibold" aria-live="polite">{item.quantity}</span>
                <button type="button" aria-label={`Increase ${item.title} quantity`} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <p className="w-24 text-right text-lg font-semibold text-primary">${(item.quantity * item.price).toFixed(2)}</p>
              <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.title}`} className="p-2 text-on-surface-variant hover:text-error">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </article>
          ))}
        </div>

        <aside className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-bold text-on-surface">Order summary</h2>
          <div className="mt-4 space-y-3 text-sm text-on-surface-variant">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-on-surface">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-on-surface">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-outline-variant pt-3 text-base font-semibold text-on-surface">
              <span>Total</span>
              <span>${(subtotal + shipping).toFixed(2)}</span>
            </div>
          </div>

          <Link
            to={items.length ? '/checkout' : '/products'}
            className="mt-6 block rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-on-primary"
          >
            {items.length ? 'Proceed to checkout' : 'Continue shopping'}
          </Link>
        </aside>
      </div>
    </div>
  );
}
