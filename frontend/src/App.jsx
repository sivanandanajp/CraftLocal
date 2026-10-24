import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';

import { Navbar } from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import BottomNav from './layouts/BottomNav';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              <Navbar />

              <main>
                <AppRoutes />
              </main>

              <BottomNav />
              <Footer />
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}