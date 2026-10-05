import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import ImageGallery from "./ImageGallery";
import QuantitySelector from "./QuantitySelector";
import ProductCard from "./ProductCard";

const product = {
  title: "Hand-Thrown Terracotta Bowl",
  price: 45.0,
  distance: "1.2km away",
  images: [
    { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfqbi2rR5TJ-jxKZHAPh3Z8Wkw9AswO-UesdNI0xPW3i_YAQWRHZKDt5Dm2LGU9hhX2q4pJb3nsm1THLI1FeVwe9d7EmRjnWgTfuNYI-V8JPFXwvbyfYZKSbGXB7fO2_KQulxi-zOwLDDIujMa26gWieBEHBgXxXPnKi0ChuhF7CVCHvd__5qBYejaWrweJRiDR377JXgs4N9Nj45a28bXwL3AnuWqNG-ZO9zXMxPp68t798XxUaHu", alt: "Main product photo of terracotta bowl" },
    { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJICaO-8XzyCQYoL6CODjCqeZ7wFqaM9tdEIyHChKZhxc2ibHvfvymRViujTF4AcydW2Y-7QF2eIUshk83A85ImqP6B6DwXEV9NBW823yC4hnq-RgTp7oh7RQUfJ6xnN2xwbLFaN17WppzbCk6VtMe_fvdc6YRduNKCt01i444tzOZ139IQhmfhy0kfaNcR5XeLk1vO6IY9JUHP-YVqVWG2aWc4FW2rQQauSt2mWxWOj3SrXcufSSH", alt: "Rim and glaze close-up" },
    { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCR2n_ONgYGnVVfMrbHdJ_OL2yJGc_DOzQCnelqkPiflKtkWFmuqRAy7HEhb4mK9tpWG5n7DewqKXcqxxR-SROpH_qBhsS0fnrr2blKrlILexwW1wIbdRWjppBoYLv53MBfZ3OWHi8y1pZdxbdfQ6uCeCJA52kzcwqKxxJ_u_LjOb-G3xYY_cVnjTj86QPIqj0Fa_AeZkOWQ3vt5-02REuLahyTkwGCZH8cWLRT5Arg_MjXQHipOmYW", alt: "Top-down view empty bowl" },
  ],
  artisan: {
    name: "Studio Terra",
    location: "Portland, OR",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkJaZ1LQ7t9-_WeN8kxBE0HYo1CLCl2dCKL4WBZI54M3ISu-hZQai7KPVelUbD1FKOWuCP3f1ByoR-jBcd1VIhDzZo-zVRsSB-BpLP-YtnluZsI1gME9fCfWaINuoL5yFuMNeb-ogY2FzXBhCjNNx5ft93dNPNEeNsZFyxIkTkfjFMIs0c4R-j8fW-iNGqPOrKuPZ0gNGlFWt_0comCOz1kO89yOj00dZ1puuCsVeMuFTvsRtK1NaP",
    bio: "Dedicated to preserving traditional pottery techniques, Studio Terra crafts functional art pieces designed for everyday living. Each piece is thrown by hand and glazed with custom-mixed, food-safe finishes reflecting the local landscape.",
  },
};

const recommendations = [
  { title: "Speckled Morning Mug", vendor: "Earth & Kiln", price: 32.0, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPl2RlWMS9zMyPArNDTX9W1MgwOv95LHRiD_xzbRLwMzmvTpIQBPh6V_kaQFAZnyQPiuKajHGuFvK4nXLrZsp6TRo2bRVf20FIhkBF5Bf6_6rYo3ekvqhJaRn_qKoXPf_hQzKyUGQs5jq0PbpyHGNT9NZ7evHS_PPgz9RNFztC7WCX5NzwMVixbBI0CsLSe_wR7b_IklDzot1LKKfLcBW_vt8uGbViNXrFX11suYD9AhjymddMtXnt", alt: "Speckled ceramic mug on wooden saucer" },
  { title: "Carved Serving Spoons", vendor: "TimberWorks", price: 45.0, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1EhN5O1RCnGhM9mD6IJLdlwuVoepZpv5BmIeDTgaQLuLuESXvf2ee2oDUxlgvx9vHPjETqFNiXDlHsybZmrFbMUsGOWqMctkyeA066XJT6x7eW68YJar3ajyTPvetGBL5mSpApqkLS_sS6fopjwsi1VkSL_23qu2FbTyYu1RxzlgeVSkZJSgBsY-ySWf0n0KO8vsVvjvZM4Kz_oVOgI-vzGy4d1zMk_7lGQms3v9VM-OSLOIvkx5L", alt: "Hand-carved wooden serving spoons" },
  { title: "Cedarwood Soy Candle", vendor: "Lumina Local", price: 28.0, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzlgtmfEd--wX8iYxs33GsgQ0itlVMSiKHSCDmaSAVhCLe6fM5ICbSBlaFFF9VrZ4D4p8LQ6QBjEctJ3D8RebvHL42Q5z2dtTkv5YatUEXKr_E_319D1YMj22qf4l-YJgPkUNtR21oSC39JQWRMDbOT3MAkme2yE-KZ1K_lt-vT2TpJ2XnTukjBdzJj_23RlS8PPqiJXgg7vDhKWFoYtX7H6Sx5tvKa8fP4M0YP4Z9TC6PRnSqoB1K", alt: "Cedarwood soy candle in ceramic jar" },
];

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleItem, isSaved } = useWishlist();
  const cartProduct = {
    id,
    title: product.title,
    price: product.price,
    image: product.images[0].src,
    vendor: product.artisan.name,
  };

  const handleAddToCart = () => {
    addItem(cartProduct, quantity);
    navigate('/cart');
  };

  const handleBuyNow = () => {
    addItem(cartProduct, quantity);
    navigate('/checkout');
  };

  const handleSave = () => {
    toggleItem(cartProduct);
  };

  const handleShare = () => {
    // Connect to share/native share sheet later
  };

  const handleFavoriteRec = (title) => {
    const recommendation = recommendations.find((item) => item.title === title);
    if (recommendation) {
      toggleItem({ ...recommendation, id: `recommendation-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` });
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
        <a className="transition-colors hover:text-primary" href="#">Home</a>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <a className="transition-colors hover:text-primary" href="#">Pottery</a>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="font-medium text-primary">Ceramic Bowl</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <ImageGallery images={product.images} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[28px] border border-outline-variant bg-surface p-5 shadow-sm md:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-tertiary-container px-2.5 py-1 text-xs font-semibold text-on-tertiary-container">Local</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {product.distance}
              </span>
            </div>

            <h1 className="mb-3 text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
              {product.title}
            </h1>
            <p className="mb-5 text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>

            <a
              className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 transition hover:border-primary/60 hover:bg-surface-container-low"
              href="#"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-outline-variant bg-surface-container">
                  <img alt="Artisan Profile" className="h-full w-full object-cover" src={product.artisan.avatar} />
                  <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface bg-secondary text-[8px] text-on-secondary">
                    check
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">By {product.artisan.name}</p>
                  <p className="text-xs text-on-surface-variant">Verified Artisan</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">chat</span>
            </a>

            <div className="mb-5 space-y-3 rounded-2xl bg-surface-container-low p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-secondary">
                <span className="material-symbols-outlined">check_circle</span>
                In Stock
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined">storefront</span>
                Ready for Pickup in 2 hours
              </div>
            </div>

            <div className="space-y-4 border-t border-outline-variant pt-5">
              <QuantitySelector quantity={quantity} onChange={setQuantity} />

              <div className="space-y-3">
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition hover:opacity-95"
                  onClick={handleAddToCart}
                >
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Add to Cart
                </button>
                <button
                  className="flex w-full items-center justify-center rounded-xl border border-secondary px-4 py-3 text-sm font-semibold text-secondary transition hover:bg-secondary-container/20"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </div>
            </div>

            <div className="mt-5 flex justify-center gap-6 border-t border-outline-variant pt-4 text-sm font-medium text-on-surface-variant">
              <button className="flex items-center gap-2 transition hover:text-primary" onClick={handleSave} aria-pressed={isSaved(id)}>
                <span className="material-symbols-outlined text-[18px]">{isSaved(id) ? 'favorite' : 'favorite_border'}</span>
                {isSaved(id) ? 'Saved' : 'Save'}
              </button>
              <button className="flex items-center gap-2 transition hover:text-primary" onClick={handleShare}>
                <span className="material-symbols-outlined text-[18px]">share</span>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 border-t border-outline-variant pt-8 lg:grid-cols-12">
        <div className="lg:col-span-4 rounded-[24px] border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <h3 className="mb-4 text-2xl font-bold text-on-surface">About the Maker</h3>
          <div className="mb-4 flex items-center gap-3">
            <img alt="Artisan" className="h-16 w-16 rounded-full object-cover" src={product.artisan.avatar} />
            <div>
              <p className="font-semibold text-on-surface">{product.artisan.name}</p>
              <p className="flex items-center gap-1 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {product.artisan.location}
              </p>
            </div>
          </div>
          <p className="mb-4 text-sm leading-7 text-on-surface-variant">{product.artisan.bio}</p>
          <button className="text-sm font-semibold text-tertiary underline transition hover:text-primary">
            View Artisan Profile
          </button>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-on-surface">More from Nearby Artisans</h2>
            <div className="flex gap-2">
              <button className="rounded-full border border-outline-variant p-2 text-on-surface-variant transition hover:border-primary hover:text-primary">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="rounded-full border border-outline-variant p-2 text-on-surface-variant transition hover:border-primary hover:text-primary">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {recommendations.map((rec) => (
              <ProductCard
                key={rec.title}
                image={rec.image}
                alt={rec.alt || rec.title}
                title={rec.title}
                vendor={rec.vendor}
                price={rec.price}
                isSaved={isSaved(`recommendation-${rec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                onFavorite={() => handleFavoriteRec(rec.title)}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}