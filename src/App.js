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
import { SearchProvider } from "./context/searchBar.js";
import SearchResults from "./pages/SearchResults";
import ProductDetails from "./pages/ProductDetails.js";
import ErrorBoundary from "./components/ErrorBoundary.js";

function App() {
  return (
    <ErrorBoundary>
   <SearchProvider>
   <CartProvider>
      <BrowserRouter>
        <AmazonNavbar />

        <div className="main-content" style={{paddingTop:'70px'}}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckOut />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetails />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
    </SearchProvider>
    </ErrorBoundary>
  );
}

export default App;