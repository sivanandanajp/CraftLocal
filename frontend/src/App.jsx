import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import BottomNav from "./layouts/BottomNav";
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
          <AppRoutes />
        </main>
        <BottomNav />
        <Footer />
      </AuthProvider>
    </BrowserRouter>
    <CartProvider>
      <WishlistProvider>
        <OrderProvider>
          <BrowserRouter>
            <Navbar />
            <main>
              <AppRoutes />
            </main>
            <BottomNav />
            <Footer />
          </BrowserRouter>
        </OrderProvider>
      </WishlistProvider>
    </CartProvider>
  );
}