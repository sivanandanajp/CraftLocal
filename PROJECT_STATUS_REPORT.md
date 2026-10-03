# CraftLocal Project Status Report

**Reviewed:** 2026-10-03  
**Scope:** Source tree and package configuration. This describes what is implemented in code; it is not a runtime or production-readiness certification.

## Project Overview

CraftLocal is a MERN-style local-artisan marketplace in progress. The repository contains a React/Vite buyer storefront, an Express/MongoDB backend, buyer/account page designs, and early authentication and product-schema work. The UI is substantially more complete than the commerce backend. Most product, cart, wishlist, order, and account data currently comes from hard-coded sample values or component state.

## Repository Structure

```text
CraftLocal/
|-- tailwind.cnfig.js                 # Root-level misspelled config filename
|-- frontend/
|   |-- index.html
|   |-- package.json                  # Vite dev/build/lint/preview scripts
|   |-- vite.config.js                # React plugin; no API proxy configured
|   |-- tailwind.config.js
|   |-- postcss.config.js
|   `-- src/
|       |-- App.jsx                   # Shared app shell and router
|       |-- main.jsx                  # React entry point
|       |-- index.css
|       |-- tailwind.cnfig.js         # Also misspelled
|       |-- components/               # Navbar, Footer, galleries, product cards,
|       |   |                         # artisan/recommendation UI, checkout forms
|       |   `-- checkout/
|       |-- context/                  # AuthContext.jsx and CartContext.jsx (empty)
|       |-- hooks/                    # useAuth.js, useFetch.js
|       |-- layouts/                  # Buyer, seller, admin, header, bottom-nav layouts
|       |-- pages/
|       |   |-- HomePage.jsx
|       |   |-- ProductsPage.jsx
|       |   |-- CategoriesPage.jsx
|       |   |-- WishlistPage.jsx
|       |   |-- CartPage.jsx
|       |   |-- ProductDetailPage.jsx # Alternate/older unmounted detail page
|       |   |-- ProductDetails/       # Routed product-detail implementation and parts
|       |   |-- auth/                 # Login, Signup, ForgotPassword
|       |   |-- checkout/             # CheckoutPage
|       |   `-- user/                 # Profile, OrderHistory, Addresses
|       |-- routes/                   # AppRoutes.jsx, empty PrivateRoute.jsx,
|       |   |                         # SellerRoute.jsx
|       |-- services/                 # Auth, cart, order, product, recommendations;
|       |   |                         # several files are empty/skeletons
|       |-- styles/                   # global.css, theme.css, variables.css
|       `-- utils/                    # constants, price formatting, helpers
`-- backend/
    |-- package.json                 # Only a placeholder test script
    `-- src/
        |-- server.js                 # Express app; mounts auth routes only
        |-- config/db.js              # MongoDB connection via MONGO_URI
        |-- controllers/              # Product/cart/order controller files are empty
        |-- middleware/               # Auth protection/seller check; empty error middleware
        |-- models/                   # User and Product schemas; Cart and Order are empty
        `-- routes/                   # Auth routes implemented; product/cart/order empty
```

## Frontend Pages Designed

The active route table is in `frontend/src/routes/AppRoutes.jsx`:

| Route | Screen | Current state |
|---|---|---|
| `/` | Home | Storefront/checkout-oriented intro with links; currently directs primary actions to checkout rather than product discovery. |
| `/products` | Products | Six hard-coded product cards; links to product detail. No backend fetch, search, filter, or sort. |
| `/categories` | Categories | Four hard-coded category tiles; all lead to the same product list without category filtering. |
| `/product/:id` | Product detail | Routed detail design with gallery, artisan info, quantity selector, and recommendations; uses one fixed sample product and has unimplemented action handlers. |
| `/wishlist` | Wishlist | Empty-state design only; no saved-items state or actions. |
| `/cart` | Cart | Two hard-coded cart lines and calculated sample totals; no quantity editing/removal or shared cart state. |
| `/checkout` | Checkout | Three-step address, delivery, and payment UI. Address and delivery steps hold temporary component state; final order is simulated with a timeout and alert. |
| `/login` | Login | Calls the backend login endpoint and stores a token/user in local storage. No global auth state or protected-route behavior is wired. |
| `/signup` | Signup | Form design only; does not submit to the registration service. |
| `/profile` | Profile | Static placeholder identity and read-only name/email; save/logout/wishlist actions are not connected. |
| `/orders` | Order history | Three hard-coded sample orders. |
| `/addresses` | Saved addresses | Add/delete operations work only in local component state; no persistence. |

Unknown paths render the home page. `ForgotPassword.jsx` exists but is not routed or connected. The separate `pages/ProductDetailPage.jsx` is an older/alternate mock implementation; the route uses `pages/ProductDetails/ProductDetailPage.jsx`.

The shared shell renders the navbar, route content, bottom navigation, and footer. The navbar includes shop/explore/wishlist/cart/checkout/profile links, but its search and mobile-menu buttons are visual controls without implemented behavior. Seller/admin layouts exist as files, but there are no seller/admin routes or pages in the active route table.

## Workflows Present Today

### Buyer browsing and checkout

1. The user opens the storefront and can navigate to the sample product list or category grid.
2. Product cards navigate to `/product/:id`, but that screen ignores the route ID and displays a fixed product.
3. Add-to-cart, buy-now, save, and share handlers are placeholders, so browsing does not populate the cart or wishlist.
4. The cart page displays its own fixed sample lines. Proceeding leads to checkout, whose address and delivery steps advance in local state.
5. Payment currently waits briefly, displays a success alert, and logs the checkout data; it does not create an order or process payment.

### Authentication

1. Login posts email/password to `http://localhost:5000/api/auth/login`, then stores response data and the JWT in local storage.
2. The backend looks up the user, compares the password hash, and returns a signed 30-day JWT.
3. Registration endpoint and password hashing exist in the backend, but the Signup screen is not connected to them. The backend user schema requires GeoJSON coordinates, which the signup form does not collect.
4. The login screen's registration link points to `/register`, while the registered frontend route is `/signup`. Forgot-password is also not implemented.

## Backend Status

- **Implemented:** Express server setup, CORS/JSON middleware, MongoDB connection helper, `/api/auth/register`, `/api/auth/login`, password hashing/comparison, JWT generation, and `protect`/`isSeller` middleware.
- **Schemas:** `User` supports buyer/seller roles and a required geospatial location. `Product` has name, description, price, image, category, and stock fields.
- **Not implemented:** Product/cart/order controllers and routes; Cart/Order schemas; product listing/detail/search endpoints; cart persistence; order creation/history/status; payment integration; profile/address/wishlist endpoints; seller product management.
- **Server wiring:** `server.js` mounts only `/api/auth`. The existing auth middleware is not applied to any route. No health endpoint or centralized error handler is active.
- **Configuration:** Backend DB setup expects `MONGO_URI`; token generation/verification expects `JWT_SECRET`. Frontend auth uses a hard-coded localhost API URL. Vite has no backend proxy configuration.
- **Commands:** Frontend defines `dev`, `build`, `lint`, and `preview`. Backend defines no start/dev script; the observed `npm start` attempt fails with `Missing script: "start"`. Its `test` script is also a placeholder that exits with an error. No test files were found in the repository inventory.

## Recommended Completion Order

### Frontend

1. Establish shared API configuration (environment-based URL, Axios instance, authorization header, consistent error handling); implement or remove empty API/service modules.
2. Connect Signup to registration, align `/register` and `/signup`, satisfy the backend's location requirement, and introduce shared auth state plus logout and protected routes.
3. Fetch products from the API and make product IDs, category navigation, search, filtering, and product-detail data real.
4. Implement shared cart and wishlist state with add/update/remove actions, persistence, and totals based on actual cart items.
5. Make checkout summary derive from the cart, validate/persist shipping and delivery details, call order creation, and show a real confirmation/error state. Integrate a payment provider before accepting card payments; do not send raw card data to the app backend.
6. Connect profile, addresses, and order history to authenticated backend endpoints; complete forgot-password and the currently inert search/mobile controls as product scope requires.
7. Decide which duplicate product-detail implementation and misspelled Tailwind config files are intended, then remove or correct unused copies.

### Backend

1. Complete Cart and Order schemas and implement their controllers and routes; add product controller/routes and mount all route modules in `server.js`.
2. Apply authentication middleware and ownership checks to user-specific cart, order, profile, and address operations; apply seller authorization to seller operations.
3. Add request validation, consistent error handling, and relevant product, cart, order, address, and account endpoints.
4. Define order price/stock validation and transaction/error behavior; integrate a payment provider using provider tokens and webhooks rather than trusting client totals.
5. Add backend start/dev scripts and automated tests; document environment setup without committing secrets.
6. Add seller product CRUD and order management if the marketplace requires seller workflows; seller/admin layouts alone do not implement these capabilities.

## Overall Assessment

The repository is at a **UI prototype plus early authentication/data-model stage**. It demonstrates the intended buyer screens and a working-looking login/register backend path, but the core purchase lifecycle is not end-to-end: product data, cart state, order creation, payment, and persisted customer account data still need implementation and integration.