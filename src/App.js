import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { CartProvider } from "./context/CartContext";
import AmazonNavbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductList from "./components/ProductList";
import CartPage from "./components/CartPage";
import CheckOut from "./pages/CheckOut.js";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AmazonNavbar />

        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckOut />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;