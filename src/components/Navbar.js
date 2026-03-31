import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSearch } from "../context/searchBar";
import { useNavigate } from "react-router-dom";
import {useAuth}  from "../context/AuthContext";
import "./Navbar.css";

 function AmazonNavbar() {
  
  const { cartCount } = useCart();
  const { searchTerm, setSearchTerm } = useSearch();
  const {user,logout}=useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate =useNavigate();

  const closeDrawer = () => setIsDrawerOpen(false);
  const openDrawer = () => setIsDrawerOpen(true);

  const handleLogout = async () => {
    await logout();
    closeDrawer();
    navigate("/login");
  };
  const handleSearch=(e)=>{
    e.preventDefault();
    if (searchTerm.trim() !==""){
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };
  return (
    <>
    <nav className="navbar navbar-dark bg-dark px-3 px-md-4 navbar-container navbar-fixed-top">
      <div className="navbar-top-row">
        <Link to="/" className="navbar-brand text-warning fw-bold fs-4">
          ShopAbhi
        </Link>

        {/* Desktop Links */}
        <div className="desktop-nav d-none d-lg-flex align-items-center">
          <Link to="/orders" className="btn btn-outline-light mx-2">
            My Orders
          </Link>
          <Link to="/" className="btn btn-outline-light mx-2 home-button">
            Home
          </Link>
          <Link to="/cart" className="btn btn-warning position-relative cart-icon-target mx-2">
            🛒 Cart
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </Link>
          {user && user.email ? (
            <button className="btn btn-outline-light mx-2" onClick={handleLogout}>
              Logout ({user.email})
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light mx-2">
                Login
              </Link>
              <Link to="/signup" className="btn btn-outline-light mx-2">
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="mobile-nav-controls d-flex d-lg-none align-items-center">
          <Link to="/cart" className="btn btn-warning position-relative cart-icon-target me-2">
            🛒
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="btn btn-outline-light mobile-menu-btn"
            onClick={openDrawer}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-row">
        <form onSubmit={handleSearch} className="d-flex w-100">
          <input
            type="text"
            className="form-control rounded-pill px-3 shadow-sm navbar-search"
            placeholder="Search products..."
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
    </nav>
    {isDrawerOpen && <div className="mobile-drawer-backdrop d-lg-none" onClick={closeDrawer} />}
    <aside className={`mobile-drawer d-lg-none ${isDrawerOpen ? "open" : ""}`}>
      <div className="drawer-header">
        <span className="drawer-title">Menu</span>
        <button type="button" className="btn btn-sm btn-outline-light" onClick={closeDrawer}>
          X
        </button>
      </div>
      <div className="drawer-links">
        <Link to="/" onClick={closeDrawer}>Home</Link>
        <Link to="/cart" onClick={closeDrawer}>Cart</Link>
        <Link to="/orders" onClick={closeDrawer}>My Orders</Link>
        {user && user.email ? (
          <button type="button" className="btn btn-outline-light mt-2" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" onClick={closeDrawer}>Login</Link>
            <Link to="/signup" onClick={closeDrawer}>Signup</Link>
          </>
        )}
      </div>
    </aside>
    </>
  );
}

export default AmazonNavbar;