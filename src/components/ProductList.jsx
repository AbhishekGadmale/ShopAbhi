import { useEffect, useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useSearch } from "../context/searchBar";
import { useLocation, useNavigate } from "react-router-dom";
import { ProductCardSkeleton } from "./Skeleton";
import { fetchWithAuth } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import Breadcrumbs from "./Breadcrumbs";

function ProductList({ hideFilters = false }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayProducts, setDisplayProducts] = useState([]);
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(8);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");

  const Navigate = useNavigate();
  const { addToCart, openMiniCart } = useCart();
  const { addToast } = useToast();
  const { user, refreshUser } = useAuth();
  const { searchTerm } = useSearch();
  const location = useLocation();
  const isSearchPage = location.pathname.includes("/search");
  const [addedItems, setAddedItems] = useState(new Set());

  const isAdded = (productId) => {
    return addedItems.has(productId);
  };

  const isWishlisted = (productId) => {
    return user?.wishlist?.some(item => (item._id || item.id) === productId);
  };

  const handleToggleWishlist = async (e, productId) => {
    e.stopPropagation();
    if (!user) {
      addToast("Please login to use wishlist", "error");
      return;
    }
    try {
      const res = await fetchWithAuth("/api/users/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        addToast(isWishlisted(productId) ? "Removed from wishlist" : "Added to wishlist");
        refreshUser();
      }
    } catch (err) {
      addToast("Failed to update wishlist", "error");
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetchWithAuth("/api/products"),
          fetchWithAuth("/api/products/categories")
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data.products || []);
        } else {
          setError("Failed to load products");
        }

        if (catRes.ok) {
          const data = await catRes.json();
          const catNames = (data.categories || []).map(c => c.name);
          setCategories(["All", ...catNames]);
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      let filtered = [...products];

      // Search Filter
      if (isSearchPage && searchTerm) {
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Category Filter
      if (selectedCategory !== "All") {
        filtered = filtered.filter((p) => p.category === selectedCategory);
      }

      // Price Filter
      filtered = filtered.filter((p) => p.price <= priceRange);

      // Rating Filter
      filtered = filtered.filter((p) => (p.rating || 0) >= minRating);

      // Sorting
      if (sortBy === "priceLow") filtered.sort((a, b) => a.price - b.price);
      if (sortBy === "priceHigh") filtered.sort((a, b) => b.price - a.price);
      if (sortBy === "rating") filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      setDisplayProducts(filtered);
      // Reset pagination on filter change
      setVisibleCount(8);
    }, 300);
    return () => clearTimeout(timer);
  }, [isSearchPage, searchTerm, products, selectedCategory, priceRange, minRating, sortBy]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  const flyToCartAnimation = (img) => {
    const cart = document.querySelector(".cart-icon-target");
    if (!cart || !img) return;
    const imgRect = img.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();
    const clone = img.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.left = imgRect.left + "px";
    clone.style.top = imgRect.top + "px";
    clone.style.width = imgRect.width + "px";
    clone.style.height = imgRect.height + "px";
    clone.style.transition = "all 0.7s ease-in-out";
    clone.style.zIndex = "9999";
    clone.style.objectFit = "contain";
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.left = cartRect.left + "px";
      clone.style.top = cartRect.top + "px";
      clone.style.width = "20px";
      clone.style.height = "20px";
      clone.style.opacity = "0.2";
    });
    setTimeout(() => clone.remove(), 800);
  };

  if (isLoading) {
    return (
      <div className="pb-12">
        {!hideFilters && <div className="h-10 w-48 bg-white/5 rounded-lg mb-8 animate-pulse" />}
        <div className="flex flex-col lg:flex-row gap-8">
          {!hideFilters && <div className="w-64 h-[500px] bg-white/5 rounded-2xl animate-pulse shrink-0" />}
        <div className="flex-grow">
            <div className={`grid gap-4 md:gap-6 ${hideFilters ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6" : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"}`}>
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <h3 className="text-white text-center mt-12 text-xl font-semibold">{error}</h3>;
  }

  const paginatedProducts = displayProducts.slice(0, visibleCount);

  return (
    <div className="pb-12">
      {!hideFilters && <Breadcrumbs />}
      <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      {!hideFilters && (
        <aside className="w-full lg:w-64 flex-shrink-0 bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 h-fit lg:sticky lg:top-28">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-lg">Filters</h3>
            <button 
              className="text-xs text-[#febd69] hover:underline"
              onClick={() => {
                setSelectedCategory("All");
                setPriceRange(50000);
                setMinRating(0);
              }}
            >
              Clear All
            </button>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h4 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-4">Category</h4>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedCategory === cat 
                      ? "bg-[#febd69] text-[#111] font-bold" 
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <h4 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-4">
              Max Price: <span className="text-white">₹{priceRange}</span>
            </h4>
            <input 
              type="range" 
              min="0" 
              max="100000" 
              step="500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#febd69] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Ratings */}
          <div className="mb-4">
            <h4 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-4">Min Rating</h4>
            <div className="flex flex-col gap-2">
              {[4, 3, 2].map((star) => (
                <button
                  key={star}
                  onClick={() => setMinRating(star)}
                  className={`flex items-center gap-2 text-sm transition-all px-3 py-2 rounded-lg ${
                    minRating === star ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="text-[#febd69]">{"★".repeat(star)}{"☆".repeat(5 - star)}</span>
                  <span>& Up</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-white">
            {isSearchPage ? `Results for "${searchTerm}"` : "Our Products"}
            <span className="text-gray-500 text-sm font-normal ml-3">
              ({displayProducts.length} items)
            </span>
          </h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-gray-400 text-sm whitespace-nowrap">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1a1a1a] text-white border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#febd69] w-full sm:w-48"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Avg. Customer Review</option>
            </select>
          </div>
        </div>

        <div className={`grid gap-4 md:gap-6 ${hideFilters ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6" : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"}`}>
          {paginatedProducts.map((p) => {
            const productId = p._id || p.id;
            return (
              <div key={productId} className="flex h-full">
                <div
                  className="group relative flex flex-col justify-between w-full bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden hover:border-[#febd69] focus-visible:ring-2 focus-visible:ring-[#febd69] outline-none transition-all duration-300 shadow-lg hover:shadow-[#febd69]/10 cursor-pointer"
                  onClick={() => Navigate(`/product/${productId}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') Navigate(`/product/${productId}`);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${p.name}`}
                >
                  <div className="aspect-[4/3] w-full bg-[#f3f3f3] p-4 flex items-center justify-center">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 [mix-blend-mode:multiply]"
                    />
                    {p.rating >= 4.5 && (
                      <span className="absolute top-2 left-2 bg-[#febd69] text-[#111] text-[10px] font-bold px-2 py-1 rounded">
                        BESTSELLER
                      </span>
                    )}
                    <button 
                      className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isWishlisted(productId) ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
                      onClick={(e) => handleToggleWishlist(e, productId)}
                    >
                      {isWishlisted(productId) ? "❤️" : "🤍"}
                    </button>
                  </div>
                  
                  <div className="p-3 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="text-[#ff9900] font-semibold text-sm md:text-base line-clamp-2 min-h-[2.5rem] flex-grow">
                        {p.name}
                      </h5>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-[#febd69] text-xs">{"★".repeat(Math.floor(p.rating || 0))}</span>
                      <span className="text-gray-500 text-[10px] font-medium">({p.numReviews || 0})</span>
                    </div>

                    <p className="text-white font-bold text-lg mb-4">₹{p.price}</p>
                    
                    <button
                      className={`mt-auto w-full py-2 rounded-lg font-bold text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
                        isAdded(productId) 
                          ? "bg-green-600 text-white" 
                          : "bg-[#ffa41c] hover:bg-[#ffb347] text-[#111]"
                      }`}
                      onClick={(e) => {
                        const img = e.currentTarget.closest(".group").querySelector("img");
                        flyToCartAnimation(img);
                        e.stopPropagation();
                        addToCart(p);
                        openMiniCart();
                        addToast(`${p.name} added to cart!`);                        setAddedItems((prev) => {
                          const next = new Set(prev);
                          next.add(productId);
                          return next;
                        });
                      }}
                    >
                      {isAdded(productId) ? (
                        <><span>Added</span><span className="text-lg">✅</span></>
                      ) : (
                        "Add to Cart"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {visibleCount < displayProducts.length && (
          <div className="mt-12 flex justify-center">
            <button 
              onClick={handleLoadMore}
              className="px-12 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all active:scale-95"
            >
              Load More Products
            </button>
          </div>
        )}
        
        {displayProducts.length === 0 && (
          <div className="text-gray-400 text-center w-full mt-12 py-20 border-2 border-dashed border-white/5 rounded-2xl">
            <p className="text-xl mb-2">No matches found.</p>
            <p className="text-sm opacity-50">Try adjusting your filters or search terms.</p>
            <button 
              onClick={() => {
                setSelectedCategory("All");
                setPriceRange(50000);
                setMinRating(0);
              }}
              className="mt-6 text-[#febd69] font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

export default ProductList;
