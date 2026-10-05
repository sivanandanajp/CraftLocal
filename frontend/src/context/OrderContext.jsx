import { createContext, useContext, useEffect, useState } from 'react';

const OrderContext = createContext(null);
const ORDER_STORAGE_KEY = 'craftlocal-orders';

const readOrders = () => {
  try {
    const savedOrders = JSON.parse(window.localStorage.getItem(ORDER_STORAGE_KEY) || '[]');
    return Array.isArray(savedOrders) ? savedOrders : [];
  } catch {
    return [];
  }
};

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(readOrders);

  useEffect(() => {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const placeOrder = ({ items, shippingAddress, deliveryMethod, paymentMethod }) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = deliveryMethod === 'express' ? 15 : 5;
    const tax = Number((subtotal * 0.08).toFixed(2));
    const order = {
      id: `CL-${Date.now()}`,
      createdAt: new Date().toISOString(),
      items: items.map((item) => ({ ...item })),
      shippingAddress: { ...shippingAddress },
      deliveryMethod,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      total: Number((subtotal + shipping + tax).toFixed(2)),
      status: 'Placed',
    };

    setOrders((currentOrders) => [order, ...currentOrders]);
    return order;
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const orderStore = useContext(OrderContext);
  if (!orderStore) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return orderStore;
}