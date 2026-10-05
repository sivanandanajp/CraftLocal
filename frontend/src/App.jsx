import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import BottomNav from "./layouts/BottomNav";
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';

export default function App() {
  return (
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