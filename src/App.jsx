import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import { CartProvider } from "./context/CartContext";
import AmazonNavbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductList from "./components/ProductList";
import CartPage from "./components/CartPage";
import CheckOut from "./pages/Checkout";
import { SearchProvider } from "./context/searchBar";
import SearchResults from "./pages/SearchResults";
import ProductDetails from "./pages/ProductDetails";
import ErrorBoundary from "./components/ErrorBoundary";
import OrderHistory from "./pages/OrderHistory.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Signup from "./pages/Signup.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SearchProvider>
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>
              <div className="min-h-screen bg-[#0f1111] flex flex-col">
                <AmazonNavbar />
                <main className="flex-grow pt-32 lg:pt-24 px-4 max-w-7xl mx-auto w-full">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckOut /></ProtectedRoute>} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </SearchProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
