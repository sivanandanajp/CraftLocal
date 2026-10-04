import { Link } from 'react-router-dom';

const cartItems = [
  { name: 'Terracotta Bowl', quantity: 1, price: 45 },
  { name: 'Cedarwood Candle', quantity: 2, price: 28 },
];

const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Your cart</p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface">Shopping bag</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-on-surface">{item.name}</h2>
                <p className="text-sm text-on-surface-variant">Qty {item.quantity}</p>
              </div>
              <p className="text-lg font-semibold text-primary">${(item.quantity * item.price).toFixed(2)}</p>
            </div>
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
              <span className="text-on-surface">$12.00</span>
            </div>
            <div className="flex justify-between border-t border-outline-variant pt-3 text-base font-semibold text-on-surface">
              <span>Total</span>
              <span>${(subtotal + 12).toFixed(2)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-on-primary"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
