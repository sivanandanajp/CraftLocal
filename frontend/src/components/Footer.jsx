
import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `text-sm transition-colors duration-200 ${
    isActive
      ? 'font-semibold text-[#A65D45]'
      : 'text-[#766A5E] hover:text-[#A65D45]'
  }`;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E5D9CA] bg-[#F0E6D8] text-[#38291F]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-14">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 md:grid-cols-4 md:gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 text-[#A65D45]"
              aria-label="CraftLocal home"
            >
              <span
                className="material-symbols-outlined text-3xl"
                aria-hidden="true"
              >
                location_on
              </span>

              <span className="font-headline text-2xl font-bold tracking-tight text-[#38291F]">
                CraftLocal
              </span>
            </NavLink>

            <p className="mt-4 max-w-xs text-sm leading-7 text-[#766A5E]">
              Discover unique handmade products from talented local artisans
              in your community.
            </p>

            <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-[#A65D45]">
              Made with care. Found locally.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h2 className="font-headline text-base font-bold text-[#38291F]">
              Shop
            </h2>

            <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Shop">
              <NavLink to="/products" className={linkClass}>
                All Products
              </NavLink>

              <NavLink to="/categories" className={linkClass}>
                Categories
              </NavLink>

              <NavLink to="/wishlist" className={linkClass}>
                Wishlist
              </NavLink>

              <NavLink to="/checkout" className={linkClass}>
                Checkout
              </NavLink>
            </nav>
          </div>

          {/* Account */}
          <div>
            <h2 className="font-headline text-base font-bold text-[#38291F]">
              Account
            </h2>

            <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Account">
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>

              <NavLink to="/signup" className={linkClass}>
                Create Account
              </NavLink>

              <NavLink to="/profile" className={linkClass}>
                My Profile
              </NavLink>

              <NavLink to="/orders" className={linkClass}>
                Order History
              </NavLink>
            </nav>
          </div>

          {/* About */}
          <div>
            <h2 className="font-headline text-base font-bold text-[#38291F]">
              Our Story
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#766A5E]">
              Supporting local makers and helping you find meaningful,
              handcrafted products made close to home.
            </p>

            <NavLink
              to="/products"
              className="mt-5 inline-flex items-center gap-2 border-b border-[#A65D45] pb-1 text-sm font-semibold text-[#A65D45] transition-colors hover:text-[#874832]"
            >
              Explore the collection
              <span aria-hidden="true">→</span>
            </NavLink>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 flex flex-col gap-4 border-t border-[#DCCBB8] pt-6 sm:mt-12 md:flex-row md:items-center md:justify-between">
          <p className="text-xs leading-5 text-[#766A5E]">
            © {new Date().getFullYear()} CraftLocal. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <NavLink
              to="/privacy"
              className="text-xs text-[#766A5E] transition-colors hover:text-[#A65D45]"
            >
              Privacy Policy
            </NavLink>

            <NavLink
              to="/terms"
              className="text-xs text-[#766A5E] transition-colors hover:text-[#A65D45]"
            >
              Terms of Service
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
