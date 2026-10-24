
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const formatPrice = (value) => {
  const price = Number(value);

  if (!Number.isFinite(price)) return 'Price unavailable';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(price);
};

const getId = (product) => String(product._id || product.id || '');

const getName = (product) =>
  product.name || product.title || product.productName || 'Handcrafted piece';

const getImage = (product) => {
  const image =
    product.image ||
    product.imageUrl ||
    product.thumbnail ||
    product.images?.[0];

  if (typeof image === 'string') return image;

  if (image && typeof image === 'object') {
    return image.url || image.secure_url || image.src || '';
  }

  return '';
};

const getCategory = (product) => {
  if (typeof product.category === 'string') return product.category;
  return product.category?.name || product.category?.title || 'Handmade';
};

export const RecommendedProducts = ({ products = [] }) => {
  const { toggleItem, isSaved } = useWishlist();

  if (!products.length) return null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
        {products.map((product, index) => {
          const id = getId(product);
          const name = getName(product);
          const image = getImage(product);
          const saved = isSaved(id);

          return (
            <article
              key={id || `${name}-${index}`}
              className="group min-w-0"
            >
              <div className="relative overflow-hidden bg-[#EEE5D9]">
                <Link
                  to={id ? `/product/${id}` : '/products'}
                  aria-label={`View ${name}`}
                  className="block"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex aspect-[4/5] items-center justify-center font-headline text-3xl italic text-[#A65D45]">
                      Craft
                    </div>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={() => toggleItem(product)}
                  aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
                  aria-pressed={saved}
                  className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-[#E8DDD0] bg-[#FAF7F1]/95 text-xl shadow-sm transition hover:border-[#A65D45] sm:right-3 sm:top-3"
                >
                  <span className={saved ? 'text-[#C74D4D]' : 'text-[#69574B]'}>
                    {saved ? '♥' : '♡'}
                  </span>
                </button>
              </div>

              <div className="pt-3 sm:pt-4">
                <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#A65D45] sm:text-[10px]">
                  {getCategory(product)}
                </p>

                <Link
                  to={id ? `/product/${id}` : '/products'}
                  className="line-clamp-2 font-headline text-base leading-5 text-[#38291F] transition hover:text-[#A65D45] sm:text-lg"
                >
                  {name}
                </Link>

                <p className="mt-2 text-sm font-medium text-[#674532]">
                  {formatPrice(product.price)}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
