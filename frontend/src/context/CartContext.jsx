import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'craftlocal-cart';

const readCart = () => {
	try {
		const savedCart = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]');
		return Array.isArray(savedCart) ? savedCart : [];
	} catch {
		return [];
	}
};

export function CartProvider({ children }) {
	const [items, setItems] = useState(readCart);

	useEffect(() => {
		window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
	}, [items]);

	const addItem = (product, quantity = 1) => {
		const id = String(product.id ?? product._id);
		const addQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
		setItems((currentItems) => {
			const existingItem = currentItems.find((item) => item.id === id);
			if (existingItem) {
				return currentItems.map((item) =>
					item.id === id ? { ...item, quantity: item.quantity + addQuantity } : item,
				);
			}
			return [
				...currentItems,
				{
					id,
					title: product.title,
					vendor: product.vendor || product.creator?.name || 'Local artisan',
					image: product.image || product.images?.[0]?.src || '',
					price: Number(product.price) || 0,
					quantity: addQuantity,
				},
			];
		});
	};

	const updateQuantity = (id, quantity) => {
		const nextQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
		setItems((currentItems) => currentItems.map((item) =>
			item.id === String(id) ? { ...item, quantity: nextQuantity } : item,
		));
	};

	const removeItem = (id) => {
		setItems((currentItems) => currentItems.filter((item) => item.id !== String(id)));
	};

	const clearCart = () => setItems([]);
	const cartCount = items.reduce((total, item) => total + item.quantity, 0);

	return (
		<CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, cartCount }}>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const cart = useContext(CartContext);
	if (!cart) {
		throw new Error('useCart must be used within a CartProvider');
	}
	return cart;
}
