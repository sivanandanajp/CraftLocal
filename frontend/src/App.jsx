import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import BottomNav from "./layouts/BottomNav";

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
  );
}