
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'craftlocal_cart';

const readSavedCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) return [];

    return parsedCart.filter(
      (item) =>
        item &&
        typeof item._id === 'string' &&
        typeof item.name === 'string' &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0 &&
        Number.isInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0
    );
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(readSavedCart);

  // Persist cart changes across browser refreshes.
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Could not save cart:', error);
    }
  }, [cartItems]);

  // Add a product or increase its quantity.
  const addToCart = (product, quantity = 1) => {
    if (!product?._id || !product?.name) {
      throw new Error('Invalid product.');
    }

    const price = Number(product.price);
    const requestedQuantity = Number(quantity);
    const stock = Number(product.stock);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error('Invalid product price.');
    }

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      throw new Error('Quantity must be at least 1.');
    }

    if (!Number.isInteger(stock) || stock < 1) {
      throw new Error('This product is out of stock.');
    }

    const existingItem = cartItems.find(
      (item) => item._id === product._id
    );

    const newQuantity =
      (existingItem?.quantity || 0) + requestedQuantity;

    if (newQuantity > stock) {
      throw new Error(`Only ${stock} item(s) are available.`);
    }

    setCartItems((currentItems) => {
      const existing = currentItems.find(
        (item) => item._id === product._id
      );

      if (existing) {
        return currentItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + requestedQuantity }
            : item
        );
      }

      return [
        ...currentItems,
        {
          _id: product._id,
          name: product.name,
          description: product.description || '',
          image: product.image || '',
          category: product.category || '',
          price,
          stock,
          quantity: requestedQuantity,
        },
      ];
    });
  };

  // Set an item's quantity, respecting its available stock.
  const updateQuantity = (productId, quantity) => {
    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity)) return;

    if (requestedQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cartItems.find(
      (cartItem) => cartItem._id === productId
    );

    if (!item) return;

    if (requestedQuantity > item.stock) {
      throw new Error(`Only ${item.stock} item(s) are available.`);
    }

    setCartItems((currentItems) =>
      currentItems.map((cartItem) =>
        cartItem._id === productId
          ? { ...cartItem, quantity: requestedQuantity }
          : cartItem
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item._id !== productId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const value = {
    cartItems,
    cartCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside a CartProvider.');
  }

  return context;
};

export default CartContext;
