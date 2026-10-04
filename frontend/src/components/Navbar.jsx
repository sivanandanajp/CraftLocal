import { NavLink } from 'react-router-dom';

export function Navbar() {
  const navLinkClass = ({ isActive }) =>
    `font-semibold transition-colors ${
      isActive
        ? 'text-primary font-bold'
        : 'text-on-surface-variant hover:text-primary-container'
    }`;

  return (
    <header className="w-full border-b border-outline-variant/40 bg-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2 text-primary"
          aria-label="CraftLocal home"
        >
          <span
            className="material-symbols-outlined text-3xl"
            aria-hidden="true"
          >
            location_on
          </span>

          <span className="font-headline text-2xl font-bold tracking-tight">
            CraftLocal
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          <NavLink to="/products" className={navLinkClass}>
            Shop
          </NavLink>

          <NavLink to="/categories" className={navLinkClass}>
            Explore
          </NavLink>

          <NavLink to="/wishlist" className={navLinkClass}>
            Wishlist
          </NavLink>

          <NavLink to="/cart" className={navLinkClass}>
            Cart
          </NavLink>

          <NavLink to="/checkout" className={navLinkClass}>
            Checkout
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">

          {/* Search */}
          <button
            type="button"
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
            aria-label="Search"
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              search
            </span>
          </button>

          {/* Profile */}
          <NavLink
            to="/profile"
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
            aria-label="Profile"
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              person
            </span>
          </NavLink>

          {/* Mobile menu placeholder */}
          <button
            type="button"
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary md:hidden"
            aria-label="Open menu"
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              menu
            </span>
          </button>

        </div>
      </div>
    </header>
  );
}

export default Navbar;