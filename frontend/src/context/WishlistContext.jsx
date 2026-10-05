import { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext(null);
const WISHLIST_STORAGE_KEY = 'craftlocal-wishlist';

const readWishlist = () => {
  try {
    const savedWishlist = JSON.parse(window.localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
    return Array.isArray(savedWishlist) ? savedWishlist : [];
  } catch {
    return [];
  }
};

const toWishlistItem = (product) => ({
  id: String(product.id ?? product._id ?? product.title),
  title: product.title,
  vendor: product.vendor || product.creator?.name || 'Local artisan',
  image: product.image || product.images?.[0]?.src || '',
  price: Number(product.price) || 0,
});

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(readWishlist);

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const toggleItem = (product) => {
    const wishlistItem = toWishlistItem(product);
    setItems((currentItems) => currentItems.some((item) => item.id === wishlistItem.id)
      ? currentItems.filter((item) => item.id !== wishlistItem.id)
      : [...currentItems, wishlistItem]);
  };

  const removeItem = (id) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== String(id)));
  };

  const isSaved = (id) => items.some((item) => item.id === String(id));

  return (
    <WishlistContext.Provider value={{ items, toggleItem, removeItem, isSaved, wishlistCount: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const wishlist = useContext(WishlistContext);
  if (!wishlist) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return wishlist;
}