import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSearch } from "../context/searchBar";
import { useNavigate } from "react-router-dom";

function AmazonNavbar() {
  const { cartCount } = useCart();
  const { searchTerm, setSearchTerm } = useSearch();
const navigate =useNavigate();
const handleSearch=(e)=>{
  e.preventDefault();
  if (searchTerm.trim() !==""){
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  }
};
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 navbar-container navbar-fixed-top" style={{position:'fixed',top:0,width:'100%',zIndex:1000}}
    
    >
      {/* Brand */}
      <Link to="/" className="navbar-brand text-warning fw-bold fs-4">
        ShopAbhi
      </Link>

      {/* Search Bar */}
      <div className="flex-grow-1 mx-3 search-bar">
        <form onSubmit={handleSearch} className="d-flex w-50 mx-3">
        <input
          type="text"
          className="form-control rounded-pill px-3 shadow-sm navbar-search"
          style={{
            maxWidth: "500px",
            border: "1px solid #ffc107",
            outline: "none",
          }}
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e)=>{
            if(e.key ==="Enter") {
              e.preventDefault();
              handleSearch(e);
            }
          }}
        />
        </form>
      </div>

      {/* Nav Buttons */}
      <div className="d-flex align-items-center">
       
        <Link to="/" className="btn btn-outline-light mx-2 home-button">
          Home
        </Link>
         <div className="cart-mobile-wrapper">
        <Link to="/cart" className="btn btn-warning position-relative cart-icon-target">
          🛒 Cart
          {cartCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {cartCount}
            </span>
          )}
        </Link>
        </div>
      </div>
    </nav>
  );
}

export default AmazonNavbar;