
import { useEffect, useState } from 'react';
import {
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react';

import { useWishlist } from '../context/WishlistContext';

export const ProductInfo = ({
  product,
  onAddToCart,
  onBuyNow,
  cartMessage,
  cartError,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { toggleItem, isSaved } = useWishlist();

  const productId = product?._id || product?.id;
  const productName =
    product?.name || product?.title || 'Handcrafted piece';

  const price = Number(product?.price);
  const stock = Number(product?.stock ?? product?.quantity ?? 0);

  const category =
    typeof product?.category === 'string'
      ? product.category
      : product?.category?.name || product?.category?.title || '';

  const artisanName =
    product?.artisan?.name ||
    product?.artisanName ||
    product?.seller?.name ||
    '';

  const hasValidPrice =
    product?.price !== undefined &&
    product?.price !== null &&
    product?.price !== '' &&
    Number.isFinite(price) &&
    price >= 0;

  const hasValidStock =
    Number.isInteger(stock) && stock > 0;

  const isWishlisted = productId
    ? isSaved(String(productId))
    : false;

  useEffect(() => {
    setQuantity(1);
    setIsAdded(false);
    setIsAdding(false);
  }, [productId]);

  // Reset the green button after 2.5 seconds.
  useEffect(() => {
    if (!isAdded) return;

    const timer = setTimeout(() => {
      setIsAdded(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isAdded]);

  const formatPrice = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);

  const handleAddToCart = async () => {
    if (
      isAdding ||
      !hasValidPrice ||
      !hasValidStock ||
      quantity > stock
    ) {
      return;
    }

    setIsAdding(true);
    setIsAdded(false);

    try {
      const success = await onAddToCart(quantity);

      if (success) {
        setIsAdded(true);
      }
    } catch (error) {
      console.error('Unable to add product to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = () => {
    if (
      !hasValidPrice ||
      !hasValidStock ||
      quantity > stock ||
      isAdding
    ) {
      return;
    }

    onBuyNow(quantity);
  };

  const handleQuantityChange = (amount) => {
    setQuantity((current) =>
      Math.max(1, Math.min(stock, current + amount))
    );

    setIsAdded(false);
  };

  const handleWishlist = () => {
    if (product) {
      toggleItem(product);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: productName,
      text: `Check out ${productName} on CraftLocal!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        alert('Product link copied to clipboard!');
      } else {
        alert(`Copy this product link: ${shareData.url}`);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Unable to share product:', error);
      }
    }
  };

  if (!product) return null;

  return (
    <div className="flex flex-col gap-5 text-[#38291F]">
      {category && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A65D45]">
          {category}
        </p>
      )}

      <div className="space-y-3">
        <h1 className="font-headline text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          {productName}
        </h1>

        <p className="text-2xl font-semibold text-[#A65D45]">
          {hasValidPrice ? formatPrice(price) : 'Price unavailable'}
        </p>

        <p className="text-sm leading-6 text-[#8B776A]">
          A thoughtful find, made with care.
        </p>
      </div>

      {product.description && (
        <div className="border-t border-[#E8DDD0] pt-5">
          <p className="text-sm leading-7 text-[#766A5E] sm:text-base">
            {product.description}
          </p>
        </div>
      )}

      {artisanName && (
        <div className="rounded-xl border border-[#E8DDD0] bg-[#FAF7F1] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B776A]">
            Crafted by
          </p>

          <p className="mt-1 font-semibold text-[#38291F]">
            {artisanName}
          </p>
        </div>
      )}

      <div className="border-b border-[#E8DDD0] pb-5">
        {hasValidStock ? (
          <p className="flex items-center gap-2 text-sm text-green-700">
            <span
              className="h-2.5 w-2.5 rounded-full bg-green-600"
              aria-hidden="true"
            />

            {stock <= 5
              ? `Only ${stock} left in stock`
              : 'In stock and ready to order'}
          </p>
        ) : (
          <p className="text-sm font-medium text-red-600">
            Currently out of stock
          </p>
        )}
      </div>

      {/* Quantity selector */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold">Quantity</span>

          {hasValidStock && (
            <p className="mt-1 text-xs text-[#8B776A]">
              {stock} available
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 rounded-full border border-[#E5D9CA] px-4 py-2.5">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isAdding}
            aria-label="Decrease quantity"
            className="rounded-full p-1 text-[#766A5E] transition hover:text-[#A65D45] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={17} />
          </button>

          <span
            className="min-w-5 text-center text-sm font-semibold"
            aria-live="polite"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            disabled={
              !hasValidStock || quantity >= stock || isAdding
            }
            aria-label="Increase quantity"
            className="rounded-full p-1 text-[#766A5E] transition hover:text-[#A65D45] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={17} />
          </button>
        </div>
      </div>

      {/* Purchase buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={
            !hasValidStock ||
            !hasValidPrice ||
            quantity > stock ||
            isAdding
          }
          className={`flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
            isAdded
              ? 'bg-green-700 text-white'
              : 'bg-[#A65D45] text-white hover:bg-[#854832]'
          }`}
        >
          {isAdding ? (
            <>
              <span className="animate-spin" aria-hidden="true">
                ⏳
              </span>
              Adding...
            </>
          ) : isAdded ? (
            <>
              <span aria-hidden="true">✓</span>
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingBag size={17} />
              Add to Cart
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={
            !hasValidStock ||
            !hasValidPrice ||
            quantity > stock ||
            isAdding
          }
          className="min-h-12 rounded-full border border-[#A65D45] bg-transparent px-5 py-3 text-sm font-semibold text-[#A65D45] transition hover:bg-[#F8F0E7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>

      {/* Confirmation displayed directly below the buttons */}
      {cartMessage && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white"
            aria-hidden="true"
          >
            ✓
          </span>

          <span>{cartMessage}</span>
        </div>
      )}

      {cartError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {cartError}
        </div>
      )}

      {/* Wishlist and share */}
      <div className="flex flex-wrap items-center gap-3 border-t border-[#E8DDD0] pt-5">
        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={isWishlisted}
          className={`flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition ${
            isWishlisted
              ? 'border-[#A65D45] bg-[#FAF0EA] text-[#A65D45]'
              : 'border-[#E5D9CA] text-[#766A5E] hover:border-[#A65D45] hover:text-[#A65D45]'
          }`}
        >
          <Heart
            size={17}
            fill={isWishlisted ? 'currentColor' : 'none'}
          />

          {isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 rounded-full border border-[#E5D9CA] px-4 py-3 text-sm font-medium text-[#766A5E] transition hover:border-[#A65D45] hover:text-[#A65D45]"
        >
          <Share2 size={17} />
          Share
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
