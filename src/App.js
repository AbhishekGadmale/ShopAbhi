import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import CartPage from "./components/CartPage";
import AmazonNavbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";

function App() {
  return (
    <div>
    
    <CartProvider>
     
      <Router>
        <AmazonNavbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
            {/* Home route shows Home component (optional intro section) */}
            <Route path="/" element={<Home />} />
            {/* Product page */}
            <Route path="/products" element={<ProductList />} />
            {/* Cart page */}
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </div>
     
      </Router>
    </CartProvider>
    </div>
  );
}

export default App;