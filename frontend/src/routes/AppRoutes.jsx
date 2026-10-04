import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Auth Protection
import ProtectedRoute from '../components/ProtectedRoute';

// Public Pages
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import CategoriesPage from '../pages/CategoriesPage';
import CartPage from '../pages/CartPage';
import ProductDetailPage from '../pages/ProductDetails/ProductDetailPage';
import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';
import Unauthorized from '../pages/Unauthorized';

// Protected User Pages
import WishlistPage from '../pages/WishlistPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import { Profile } from '../pages/user/Profile';
import { OrderHistory } from '../pages/user/OrderHistory';
import { Addresses } from '../pages/user/Addresses';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 2. Protected Routes (Requires Login) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/addresses" element={<Addresses />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>

      {/* 3. Seller / Artisan Routes */}
      <Route element={<ProtectedRoute allowedRoles={['seller', 'artisan']} />}>
        <Route 
          path="/seller/dashboard" 
          element={<div className="p-10 text-2xl font-bold text-gray-800">Welcome to Seller Dashboard</div>} 
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};

export default AppRoutes;