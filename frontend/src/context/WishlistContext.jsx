
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = 'craftlocal-wishlist';

const readWishlist = () => {
  try {
    const saved = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = JSON.parse(saved || '[]');

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && (item.id || item._id))
      .map((item) => ({
        ...item,
        id: String(item.id || item._id),
        name: item.name || item.title || 'Handcrafted product',
        title: item.title || item.name || 'Handcrafted product',
        category: item.category || 'Handcrafted',
        vendor: item.vendor || 'Local artisan',
        image: item.image || item.images?.[0]?.src || '',
        price: Number(item.price) || 0,
        stock:
          item.stock === undefined || item.stock === null
            ? null
            : Number(item.stock),
      }));
  } catch {
    return [];
  }
};

const toWishlistItem = (product) => ({
  id: String(
    product._id ?? product.id ?? product.title ?? product.name
  ),
  name: product.name || product.title || 'Handcrafted product',
  title: product.title || product.name || 'Handcrafted product',
  category: product.category || 'Handcrafted',
  vendor: product.vendor || product.creator?.name || 'Local artisan',
  image: product.image || product.images?.[0]?.src || '',
  price: Number(product.price) || 0,
  stock:
    product.stock === undefined || product.stock === null
      ? null
      : Number(product.stock),
});

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(readWishlist);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error('Unable to save wishlist:', error);
    }
  }, [items]);

  const toggleItem = (product) => {
    if (!product) return;

    const wishlistItem = toWishlistItem(product);

    setItems((currentItems) => {
      const alreadySaved = currentItems.some(
        (item) => String(item.id) === wishlistItem.id
      );

      if (alreadySaved) {
        return currentItems.filter(
          (item) => String(item.id) !== wishlistItem.id
        );
      }

      return [...currentItems, wishlistItem];
    });
  };

  const addItem = (product) => {
    if (!product) return;

    const wishlistItem = toWishlistItem(product);

    setItems((currentItems) => {
      const alreadySaved = currentItems.some(
        (item) => String(item.id) === wishlistItem.id
      );

      return alreadySaved
        ? currentItems
        : [...currentItems, wishlistItem];
    });
  };

  const removeItem = (id) => {
    setItems((currentItems) =>
      currentItems.filter((item) => String(item.id) !== String(id))
    );
  };

  const isSaved = (id) =>
    items.some((item) => String(item.id) === String(id));

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleItem,
        addItem,
        removeItem,
        isSaved,
        wishlistCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const wishlist = useContext(WishlistContext);

  if (!wishlist) {
    throw new Error(
      'useWishlist must be used within a WishlistProvider'
    );
  }

  return wishlist;
}
