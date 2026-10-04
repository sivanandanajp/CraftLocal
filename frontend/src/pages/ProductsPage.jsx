import { Link } from 'react-router-dom';
import ProductCard from './ProductDetails/ProductCard';

const products = [
  {
    id: 1,
    title: 'Hand-Thrown Terracotta Bowl',
    vendor: 'Studio Terra',
    price: 45,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBfqbi2rR5TJ-jxKZHAPh3Z8Wkw9AswO-UesdNI0xPW3i_YAQWRHZKDt5Dm2LGU9hhX2q4pJb3nsm1THLI1FeVwe9d7EmRjnWgTfuNYI-V8JPFXwvbyfYZKSbGXB7fO2_KQulxi-zOwLDDIujMa26gWieBEHBgXxXPnKi0ChuhF7CVCHvd__5qBYejaWrweJRiDR377JXgs4N9Nj45a28bXwL3AnuWqNG-ZO9zXMxPp68t798XxUaHu',
    alt: 'Terracotta bowl',
  },
  {
    id: 2,
    title: 'Speckled Morning Mug',
    vendor: 'Earth & Kiln',
    price: 32,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCPl2RlWMS9zMyPArNDTX9W1MgwOv95LHRiD_xzbRLwMzmvTpIQBPh6V_kaQFAZnyQPiuKajHGuFvK4nXLrZsp6TRo2bRVf20FIhkBF5Bf6_6rYo3ekvqhJaRn_qKoXPf_hQzKyUGQs5jq0PbpyHGNT9NZ7evHS_PPgz9RNFztC7WCX5NzwMVixbBI0CsLSe_wR7b_IklDzot1LKKfLcBW_vt8uGbViNXrFX11suYD9AhjymddMtXnt',
    alt: 'Speckled mug',
  },
  {
    id: 3,
    title: 'Cedarwood Soy Candle',
    vendor: 'Lumina Local',
    price: 28,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAzlgtmfEd--wX8iYxs33GsgQ0itlVMSiKHSCDmaSAVhCLe6fM5ICbSBlaFFF9VrZ4D4p8LQ6QBjEctJ3D8RebvHL42Q5z2dtKkv5YatUEXKr_E_319D1YMj22qf4l-YJgPkUNtR21oSC39JQWRMDbOT3MAkme2yE-KZ1K_lt-vT2TpJ2XnTukjBdzJj_23RlS8PPqiJXgg7vDhKWFoYtX7H6Sx5tvKa8fP4M0YP4Z9TC6PRnSqoB1K',
    alt: 'Candle jar',
  },
  {
    id: 4,
    title: 'Carved Serving Spoons',
    vendor: 'TimberWorks',
    price: 45,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1EhN5O1RCnGhM9mD6IJLdlwuVoepZpv5BmIeDTgaQLuLuESXvf2ee2oDUxlgvx9vHPjETqFNiXDlHsybZmrFbMUsGOWqMctkyeA066XJT6x7eW68YJar3ajyTPvetGBL5mSpApqkLS_sS6fopjwsi1VkSL_23qu2FbTyYu1RxzlgeVSkZJSgBsY-ySWf0n0KO8vsVvjvZM4Kz_oVOgI-vzGy4d1zMk_7lGQms3v9VM-OSLOIvkx5L',
    alt: 'Wooden serving spoon',
  },
  {
    id: 5,
    title: 'Woven Storage Basket',
    vendor: 'Canopy Co.',
    price: 58,
    image:
      'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
    alt: 'Woven basket',
  },
  {
    id: 6,
    title: 'Herbal Tea Set',
    vendor: 'Verdant Table',
    price: 39,
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    alt: 'Tea set',
  },
];

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Shop</p>
          <h1 className="mt-2 text-3xl font-bold text-on-surface md:text-4xl">Handcrafted finds</h1>
        </div>
        <Link
          to="/checkout"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary"
        >
          Go to checkout
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`} className="block">
            <ProductCard
              image={product.image}
              alt={product.alt}
              title={product.title}
              vendor={product.vendor}
              price={product.price}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
