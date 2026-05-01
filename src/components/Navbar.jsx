import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSearch } from "../context/searchBar";
import { useAuth } from "../context/AuthContext";

function AmazonNavbar() {
  const { cartCount } = useCart();
  const { searchTerm, setSearchTerm } = useSearch();
  const { user, logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const closeDrawer = () => setIsDrawerOpen(false);
  const openDrawer = () => setIsDrawerOpen(true);

  const handleLogout = async () => {
    await logout();
    closeDrawer();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[9999] bg-[#131921] shadow-lg px-4 py-2 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="text-[#febd69] font-bold text-2xl">
            ShopAbhi
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/orders" className="text-white border border-white/30 hover:bg-white/10 px-4 py-1.5 rounded-md transition">
              My Orders
            </Link>
            <Link to="/" className="text-white border border-white/30 hover:bg-white/10 px-4 py-1.5 rounded-md transition">
              Home
            </Link>
            <Link to="/cart" className="relative bg-[#febd69] hover:bg-[#f3a847] text-[#111] font-bold px-4 py-1.5 rounded-md transition cart-icon-target">
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#131921]">
                  {cartCount}
                </span>
              )}
            </Link>
            {user && user.email ? (
              <button className="text-white border border-white/30 hover:bg-white/10 px-4 py-1.5 rounded-md transition" onClick={handleLogout}>
                Logout ({user.email.split('@')[0]})
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="text-white border border-white/30 hover:bg-white/10 px-4 py-1.5 rounded-md transition">
                  Login
                </Link>
                <Link to="/signup" className="text-white border border-white/30 hover:bg-white/10 px-4 py-1.5 rounded-md transition">
                  Signup
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-3">
            <Link to="/cart" className="relative bg-[#febd69] text-[#111] p-2 rounded-md cart-icon-target">
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#131921]">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="text-white text-2xl p-1"
              onClick={openDrawer}
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full">
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto flex">
            <input
              type="text"
              className="w-full rounded-full px-4 py-1.5 bg-white text-gray-900 border-2 border-[#febd69] focus:outline-none focus:ring-2 focus:ring-[#ffa41c] shadow-sm"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-[10000] lg:hidden transition-opacity" onClick={closeDrawer} />
      )}
      <aside className={`fixed top-0 right-0 h-full w-64 bg-[#232f3e] z-[10001] shadow-2xl transform transition-transform duration-300 lg:hidden ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <span className="text-[#febd69] font-bold text-lg">Menu</span>
          <button className="text-white hover:text-gray-300 transition text-xl" onClick={closeDrawer}>
            ✕
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <Link to="/" onClick={closeDrawer} className="text-white hover:text-[#febd69] py-2 border-b border-white/5 transition">Home</Link>
          <Link to="/cart" onClick={closeDrawer} className="text-white hover:text-[#febd69] py-2 border-b border-white/5 transition">Cart</Link>
          <Link to="/orders" onClick={closeDrawer} className="text-white hover:text-[#febd69] py-2 border-b border-white/5 transition">My Orders</Link>
          {user && user.email ? (
            <button className="w-full text-center bg-transparent border border-white/30 text-white py-2 rounded-md hover:bg-white/10 transition mt-2" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link to="/login" onClick={closeDrawer} className="text-center bg-[#febd69] text-[#111] py-2 rounded-md font-bold transition">Login</Link>
              <Link to="/signup" onClick={closeDrawer} className="text-center border border-white/30 text-white py-2 rounded-md hover:bg-white/10 transition">Signup</Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default AmazonNavbar;