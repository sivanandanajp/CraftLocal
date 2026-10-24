
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const { cartCount } = useCart();

  const navItems = [
    { label: 'Shop', to: '/products' },
    { label: 'Collections', to: '/categories' },
    { label: 'Wishlist', to: '/wishlist' },
  ];

  const navLinkClass = ({ isActive }) =>
    `relative py-2 text-sm tracking-wide transition-colors duration-200 ${
      isActive
        ? 'font-semibold text-[#A65D45]'
        : 'font-medium text-[#625348] hover:text-[#A65D45]'
    }`;

  const closePanels = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    closePanels();

    if (query) {
      navigate(`/products?keyword=${encodeURIComponent(query)}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E9DFD3] bg-[#FAF7F1]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[78px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7 lg:h-[88px] lg:px-12">
        {/* Brand */}
        <NavLink
          to="/"
          onClick={closePanels}
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="CraftLocal home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DCC8B5] text-[#A65D45] transition-colors group-hover:bg-[#F0E6D8]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 21s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12Z" />
              <path d="M9 10.5c1.5-2.5 4.5-2.5 6 0M9.5 13c1.2 1 3.8 1 5 0" />
            </svg>
          </span>

          <span className="flex flex-col">
            <span className="font-headline text-2xl font-semibold leading-none tracking-[-0.045em] text-[#38291F] sm:text-[28px]">
              CraftLocal
            </span>
            <span className="mt-1 hidden text-[10px] uppercase tracking-[0.18em] text-[#947D69] sm:block">
              Made with meaning
            </span>
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-8 md:flex lg:gap-10"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClass}
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-[3px] left-0 h-px w-full bg-[#A65D45]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Search */}
          <button
            type="button"
            onClick={() => {
              setSearchOpen((open) => !open);
              setMenuOpen(false);
            }}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
              searchOpen
                ? 'bg-[#EFE4D7] text-[#A65D45]'
                : 'text-[#625348] hover:bg-[#F0E6D8] hover:text-[#A65D45]'
            }`}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
            aria-expanded={searchOpen}
          >
            {searchOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.5 4.5" />
              </svg>
            )}
          </button>

          {/* Cart with live item count */}
          <NavLink
            to="/cart"
            onClick={closePanels}
            className={({ isActive }) =>
              `relative flex h-11 w-11 items-center justify-center rounded-full transition ${
                isActive
                  ? 'bg-[#EFE4D7] text-[#A65D45]'
                  : 'text-[#625348] hover:bg-[#F0E6D8] hover:text-[#A65D45]'
              }`
            }
            aria-label={`Shopping cart, ${cartCount} ${
              cartCount === 1 ? 'item' : 'items'
            }`}
            title={`Shopping cart (${cartCount})`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
              <circle cx="9.5" cy="20" r="1" />
              <circle cx="17.5" cy="20" r="1" />
            </svg>

            {cartCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#FAF7F1] bg-[#A65D45] px-1 text-[10px] font-bold leading-none text-white"
                aria-hidden="true"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </NavLink>

          {/* Account */}
          <NavLink
            to="/profile"
            onClick={closePanels}
            className={({ isActive }) =>
              `hidden h-11 w-11 items-center justify-center rounded-full transition sm:flex ${
                isActive
                  ? 'bg-[#EFE4D7] text-[#A65D45]'
                  : 'text-[#625348] hover:bg-[#F0E6D8] hover:text-[#A65D45]'
              }`
            }
            aria-label="My account"
            title="My account"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20a7 7 0 0 1 14 0" />
            </svg>
          </NavLink>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen((open) => !open);
              setSearchOpen(false);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#625348] transition hover:bg-[#F0E6D8] hover:text-[#A65D45] md:hidden"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Search Panel */}
      {searchOpen && (
        <div className="border-t border-[#E9DFD3] bg-[#FAF7F1] px-4 py-5 sm:px-7">
          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-2xl items-center gap-3"
          >
            <label htmlFor="navbar-search" className="sr-only">
              Search products
            </label>

            <div className="relative min-w-0 flex-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#947D69]"
                aria-hidden="true"
              >
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.5 4.5" />
              </svg>

              <input
                id="navbar-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search handmade finds..."
                autoFocus
                className="w-full rounded-full border border-[#E4D8CA] bg-white py-3.5 pl-12 pr-4 text-base text-[#38291F] outline-none transition placeholder:text-[#A29487] focus:border-[#A65D45]"
              />
            </div>

            <button
              type="submit"
              className="shrink-0 bg-[#A65D45] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#874832]"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav
          className="border-t border-[#E9DFD3] bg-[#FAF7F1] px-5 pb-5 pt-3 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col">
            {[
              { label: 'Home', to: '/' },
              { label: 'Shop all products', to: '/products' },
              { label: 'Explore collections', to: '/categories' },
              { label: 'My wishlist', to: '/wishlist' },
              {
                label: `Shopping cart${cartCount > 0 ? ` (${cartCount})` : ''}`,
                to: '/cart',
              },
              { label: 'My account', to: '/profile' },
            ].map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closePanels}
                className={({ isActive }) =>
                  `flex items-center justify-between border-b border-[#E9DFD3] py-4 text-base transition ${
                    isActive
                      ? 'font-semibold text-[#A65D45]'
                      : 'text-[#594B3F] hover:text-[#A65D45]'
                  }`
                }
              >
                {item.label}
                <span
                  className="text-lg text-[#A65D45]/70"
                  aria-hidden="true"
                >
                  {index === 0 ? '⌂' : '↗'}
                </span>
              </NavLink>
            ))}

            <NavLink
              to="/checkout"
              onClick={closePanels}
              className="mt-4 flex items-center justify-center bg-[#A65D45] px-5 py-4 text-base font-medium text-white transition hover:bg-[#874832]"
            >
              Continue to checkout →
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
