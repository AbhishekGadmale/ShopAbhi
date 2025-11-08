import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function AmazonNavbar() {
  const { cartCount } = useCart();

  return (
    <nav className="navbar navbar-dark bg-dark px-4">
      <Link to="/" className="navbar-brand text-warning fw-bold fs-4">
        ShopAbhi
      </Link>

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