import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSearch } from "../context/searchBar";

function AmazonNavbar() {
  const { cartCount } = useCart();
  const { searchTerm, setSearchTerm } = useSearch();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      {/* Brand */}
      <Link to="/" className="navbar-brand text-warning fw-bold fs-4">
        ShopAbhi
      </Link>

      {/* Search Bar */}
      <div className="flex-grow-1 mx-3">
        <input
          type="text"
          className="form-control rounded-pill px-3 shadow-sm"
          style={{
            maxWidth: "500px",
            border: "1px solid #ffc107",
            outline: "none",
          }}
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Nav Buttons */}
      <div className="d-flex align-items-center">
        <Link to="/" className="btn btn-outline-light mx-2">
          Home
        </Link>
        <Link to="/cart" className="btn btn-warning position-relative">
          🛒 Cart
          {cartCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

export default AmazonNavbar;