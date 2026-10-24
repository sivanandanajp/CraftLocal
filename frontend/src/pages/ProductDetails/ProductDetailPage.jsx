
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ProductGallery } from '../../components/ProductGallery';
import { ProductInfo } from '../../components/ProductInfo';
import { RecommendedProducts } from '../../components/RecommendedProduct';
import ReviewSection from '../../components/ReviewSection';

const API_URL = 'http://localhost:5000/api/products';

const getId = (product) => String(product?._id || product?.id || '');

const getName = (product) =>
  product?.name || product?.title || product?.productName || 'Handcrafted piece';

const getImage = (product) => {
  const image =
    product?.image ||
    product?.imageUrl ||
    product?.thumbnail ||
    product?.images?.[0];

  if (typeof image === 'string') return image;

  if (image && typeof image === 'object') {
    return image.url || image.secure_url || image.src || '';
  }

  return '';
};

const getImages = (product) => {
  const images = [
    product?.image,
    product?.imageUrl,
    product?.thumbnail,
    ...(Array.isArray(product?.images) ? product.images : []),
  ]
    .map((image) => {
      if (typeof image === 'string') return image;

      if (image && typeof image === 'object') {
        return image.url || image.secure_url || image.src || '';
      }

      return '';
    })
    .filter(Boolean);

  return [...new Set(images)];
};

const getCategory = (product) => {
  const category = product?.category;

  if (typeof category === 'string') return category;

  if (category && typeof category === 'object') {
    return category.name || category.title || '';
  }

  return '';
};

const getArtisan = (product) =>
  product?.artisan?.name ||
  product?.seller?.name ||
  product?.creator?.name ||
  product?.makerName ||
  product?.vendor ||
  product?.brand ||
  '';

const getPrice = (product) => Number(product?.price);

async function readResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to load this product.');
  }

  return data;
}

function unwrapProduct(data) {
  if (data?.product) return data.product;
  if (data?.data && !Array.isArray(data.data)) return data.data;
  return data;
}

function getProductList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data?.products)) return data.data.products;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-[#FAF7F1] px-5 py-12 text-[#38291F] sm:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-8 h-3 w-48 bg-[#E8DDD0]" />

        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div className="aspect-[4/3] bg-[#EEE5D9]" />

          <div className="space-y-5 py-4">
            <div className="h-3 w-24 bg-[#E8DDD0]" />
            <div className="h-10 w-4/5 bg-[#E8DDD0]" />
            <div className="h-6 w-28 bg-[#E8DDD0]" />
            <div className="h-24 bg-[#E8DDD0]" />
            <div className="h-12 bg-[#E8DDD0]" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [cartError, setCartError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError('');
      setProduct(null);
      setRecommendations([]);
      setCartMessage('');
      setCartError('');

      try {
        let currentProduct;

        try {
          const response = await fetch(
            `${API_URL}/${encodeURIComponent(id)}`,
            { signal: controller.signal }
          );

          const data = await readResponse(response);
          currentProduct = unwrapProduct(data);
        } catch (requestError) {
          if (requestError.name === 'AbortError') {
            throw requestError;
          }

          const response = await fetch(API_URL, {
            signal: controller.signal,
          });

          const data = await readResponse(response);
          const list = getProductList(data);

          currentProduct = list.find(
            (item) => getId(item) === String(id)
          );
        }

        if (controller.signal.aborted) return;

        if (!currentProduct || getId(currentProduct) !== String(id)) {
          throw new Error('This product could not be found.');
        }

        setProduct(currentProduct);

        try {
          const response = await fetch(
            `${API_URL}?page=1&limit=100`,
            { signal: controller.signal }
          );

          const data = await readResponse(response);
          const list = getProductList(data);

          if (!controller.signal.aborted) {
            const currentCategory = getCategory(currentProduct)
              .trim()
              .toLowerCase();

            const otherProducts = list.filter(
              (item) => getId(item) !== getId(currentProduct)
            );

            const sameCategory = otherProducts.filter(
              (item) =>
                currentCategory &&
                getCategory(item).trim().toLowerCase() === currentCategory
            );

            const differentCategory = otherProducts.filter(
              (item) =>
                !currentCategory ||
                getCategory(item).trim().toLowerCase() !== currentCategory
            );

            setRecommendations(
              [...sameCategory, ...differentCategory].slice(0, 8)
            );
          }
        } catch (recommendationError) {
          if (recommendationError.name !== 'AbortError') {
            console.warn(
              'Could not load recommendations:',
              recommendationError
            );
          }
        }
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Something went wrong.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadProduct();
    } else {
      setError('No product was selected.');
      setLoading(false);
    }

    return () => controller.abort();
  }, [id]);

  const handleAddToCart = (quantity) => {
    if (!product) return false;

    try {
      addToCart(
        {
          ...product,
          _id: getId(product),
          name: getName(product),
          price: getPrice(product),
          image: getImage(product),
          category: getCategory(product),
        },
        quantity
      );

      setCartMessage('Added to your cart.');
      setCartError('');
      return true;
    } catch (cartError) {
      setCartMessage('');
      setCartError(
        cartError.message || 'This item could not be added to your cart.'
      );
      return false;
    }
  };

  const handleBuyNow = (quantity) => {
    if (!product) return;

    try {
      addToCart(
        {
          ...product,
          _id: getId(product),
          name: getName(product),
          price: getPrice(product),
          image: getImage(product),
          category: getCategory(product),
        },
        quantity
      );

      navigate('/checkout');
    } catch (cartError) {
      setCartMessage('');
      setCartError(
        cartError.message || 'This item could not be added to your cart.'
      );
    }
  };

  if (loading) return <LoadingState />;

  if (error || !product) {
    return (
      <main className="min-h-[60vh] bg-[#FAF7F1] px-5 py-16 text-center text-[#38291F] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#A65D45]">
          CraftLocal collection
        </p>

        <h1 className="mt-4 font-headline text-3xl sm:text-4xl">
          We couldn't find that piece.
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#827366]">
          {error || 'This product may no longer be available.'}
        </p>

        <Link
          to="/products"
          className="mt-7 inline-flex bg-[#A65D45] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#874832]"
        >
          Explore the collection
        </Link>
      </main>
    );
  }

  const name = getName(product);
  const category = getCategory(product);
  const images = getImages(product);
  const artisanName = getArtisan(product);

  const description =
    product.description ||
    product.details ||
    product.productDescription ||
    '';

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF7F1] pb-12 text-[#38291F] sm:pb-16">
      <div className="mx-auto max-w-[1380px] px-4 pt-6 sm:px-7 sm:pt-9 lg:px-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-7 flex flex-wrap items-center gap-2 text-xs text-[#827366] sm:mb-9"
        >
          <Link className="transition hover:text-[#A65D45]" to="/">
            Home
          </Link>

          <span aria-hidden="true">/</span>

          <Link
            className="transition hover:text-[#A65D45]"
            to="/products"
          >
            Collection
          </Link>

          {category && (
            <>
              <span aria-hidden="true">/</span>

              <Link
                className="transition hover:text-[#A65D45]"
                to={`/products?category=${encodeURIComponent(category)}`}
              >
                {category}
              </Link>
            </>
          )}

          <span aria-hidden="true">/</span>

          <span
            className="max-w-[180px] truncate text-[#38291F]"
            aria-current="page"
          >
            {name}
          </span>
        </nav>

        <section className="grid items-start gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
          <ProductGallery images={images} productName={name} />

          <ProductInfo
            product={product}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            cartMessage={cartMessage}
            cartError={cartError}
          />
        </section>

        <section className="mt-12 grid gap-8 border-t border-[#E5D9CA] pt-9 sm:mt-16 sm:pt-12 md:grid-cols-2 md:gap-14">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A65D45]">
              The details
            </p>

            <h2 className="mt-3 font-headline text-2xl sm:text-3xl">
              Made to be lived with.
            </h2>

            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#766A5E]">
              {description ||
                'Details about this piece have not been provided yet.'}
            </p>

            {category && (
              <p className="mt-5 text-xs text-[#827366]">
                Category:{' '}
                <span className="text-[#38291F]">{category}</span>
              </p>
            )}
          </div>

          <div className="bg-[#F0E6D8] p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A65D45]">
              Behind the piece
            </p>

            <h2 className="mt-3 font-headline text-2xl sm:text-3xl">
              A little more meaning in the everyday.
            </h2>

            {artisanName ? (
              <p className="mt-4 text-sm leading-7 text-[#766A5E]">
                Created by {artisanName}. Discover a piece selected for its
                character and thoughtful craftsmanship.
              </p>
            ) : (
              <p className="mt-4 text-sm leading-7 text-[#766A5E]">
                Every creation has its own character. Artisan details for this
                piece have not been provided.
              </p>
            )}

            <Link
              to="/categories"
              className="mt-6 inline-flex border-b border-[#A65D45] pb-1 text-xs font-semibold text-[#8E4B35] transition hover:text-[#38291F]"
            >
              Explore more crafts →
            </Link>
          </div>
        </section>

        {recommendations.length > 0 && (
          <section className="mt-12 border-t border-[#E5D9CA] pt-9 sm:mt-16 sm:pt-12">
            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A65D45]">
                You may also like
              </p>

              <h2 className="mt-2 font-headline text-2xl sm:text-3xl">
                More thoughtful finds.
              </h2>
            </div>

            <RecommendedProducts products={recommendations} />
          </section>
        )}

        <ReviewSection
          productId={getId(product)}
          productSellerId={
            product.sellerId?._id ||
            product.sellerId ||
            product.seller?._id ||
            product.seller?.id ||
            ''
          }
        />
      </div>
    </main>
  );
}
