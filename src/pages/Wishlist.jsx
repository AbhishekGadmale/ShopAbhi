import React from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api/client";
import Breadcrumbs from "../components/Breadcrumbs";

function Wishlist() {
  const { user, refreshUser } = useAuth();
  const { addToCart, openMiniCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleToggleWishlist = async (productId) => {
    try {
      const res = await fetchWithAuth("/api/users/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        addToast("Removed from wishlist");
        refreshUser();
      }
    } catch (err) {
      addToast("Failed to update wishlist", "error");
    }
  };

  const moveToCart = (product) => {
    addToCart(product);
    handleToggleWishlist(product._id || product.id);
    openMiniCart();
    addToast(`${product.name} moved to cart!`);
  };

  if (!user) return null;

  return (
    <div className="max-w-[1440px] mx-auto py-8 px-4 min-h-[60vh]">
      <Breadcrumbs />
      
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-white">Your Wishlist</h1>
        <span className="text-gray-400 font-medium">({user.wishlist?.length || 0} items)</span>
      </div>

      {user.wishlist && user.wishlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6">
          {user.wishlist.map((product) => {
            const productId = product._id || product.id;
            return (
              <div 
                key={productId}
                className="group relative bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#febd69] transition-all flex flex-col"
              >
                {/* Image Section */}
                <div 
                  className="aspect-[4/3] bg-[#f3f3f3] p-4 flex items-center justify-center cursor-pointer relative"
                  onClick={() => navigate(`/product/${productId}`)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                  />
                  <button 
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWishlist(productId);
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-3 flex flex-col flex-grow">
                  <h3 
                    className="text-white font-bold text-sm mb-1 line-clamp-2 hover:text-[#febd69] cursor-pointer"
                    onClick={() => navigate(`/product/${productId}`)}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-[#febd69] text-xs">{"★".repeat(Math.floor(product.rating || 0))}</span>
                    <span className="text-gray-500 text-[10px]">({product.numReviews || 0})</span>
                  </div>
                  <p className="text-[#febd69] font-bold text-lg mb-4">₹{product.price}</p>
                  
                  <button
                    className="mt-auto w-full py-2 bg-[#ffa41c] hover:bg-[#ffb347] text-[#111] font-bold rounded-lg text-sm transition-all active:scale-95"
                    onClick={() => moveToCart(product)}
                  >
                    Move to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <div className="text-6xl mb-6 opacity-20">❤️</div>
          <h2 className="text-xl font-bold text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 text-sm max-w-xs mb-8">
            Add items that you like to your wishlist. They will be waiting for you here.
          </p>
          <button 
            onClick={() => navigate("/")}
            className="px-10 py-3 bg-[#febd69] text-[#111] font-bold rounded-xl active:scale-95 transition-all"
          >
            Go Shopping
          </button>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
