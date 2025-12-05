import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { CartProvider } from "./context/CartContext";
import AmazonNavbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductList from "./components/ProductList";
import CartPage from "./components/CartPage";
import Checkout from "./pages/Checkout.js";
import { SearchProvider } from "./context/searchBar.js";
import SearchResults from "./pages/SearchResults";

function App() {
  return (
   <SearchProvider>
   <CartProvider>
      <BrowserRouter>
        <AmazonNavbar />

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckOut />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
    </SearchProvider>
  );
}

export default App;
