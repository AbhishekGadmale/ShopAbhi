import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fetchWithAuth } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

function SearchResults() {
  const { search } = useLocation();
  const query = new URLSearchParams(search).get("q")?.toLowerCase() || "";
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetchWithAuth("/api/products");
        const data = await res.json();
        if (res.ok) {
          setProducts(data.products || []);
        } else {
          setError(data.message || "Failed to load products");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const priceRanges = [
    { label: "Under ₹1000", min: 0, max: 1000 },
    { label: "₹1000 - ₹3000", min: 1000, max: 3000 },
    { label: "₹3000 - ₹5000", min: 3000, max: 5000 },
    { label: "₹5000+", min: 5000, max: Infinity },
  ];

  const categories = ["Electronics", "Accessories", "Fashion", "Food", "Beauty"];

  const togglePrice = (label) => {
    setSelectedPrices((prev) =>
      prev.includes(label)
        ? prev.filter((r) => r !== label)
        : [...prev, label]
    );
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query);

    const matchesPrice =
      selectedPrices.length === 0 ||
      selectedPrices.some((label) => {
        const range = priceRanges.find((r) => r.label === label);
        return p.price >= range.min && p.price <= range.max;
      });

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.category);

    return matchesQuery && matchesPrice && matchesCategory;
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <h3 className="text-white text-center mt-12 text-xl font-semibold">{error}</h3>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 flex-shrink-0 bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 self-start">
        <h5 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <span>⚙️</span> Filters
        </h5>

        <div className="space-y-8">
          <div>
            <label className="text-[#febd69] font-bold text-xs uppercase tracking-wider mb-4 block">Price Range</label>
            <div className="space-y-3">
              {priceRanges.map((r) => (
                <label key={r.label} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-transparent text-[#febd69] focus:ring-[#febd69]"
                    checked={selectedPrices.includes(r.label)}
                    onChange={() => togglePrice(r.label)}
                  />
                  <span className="text-gray-400 group-hover:text-white transition text-sm">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[#febd69] font-bold text-xs uppercase tracking-wider mb-4 block">Category</label>
            <div className="space-y-3">
              {categories.map((c) => (
                <label key={c} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-transparent text-[#febd69] focus:ring-[#febd69]"
                    checked={selectedCategories.includes(c)}
                    onChange={() => toggleCategory(c)}
                  />
                  <span className="text-gray-400 group-hover:text-white transition text-sm">{c}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => {setSelectedPrices([]); setSelectedCategories([])}}
          className="mt-8 w-full py-2 text-xs font-bold text-gray-500 hover:text-[#febd69] transition uppercase tracking-widest"
        >
          Clear All
        </button>
      </aside>

      {/* Results Section */}
      <div className="flex-grow">
        <h3 className="text-2xl font-bold text-white mb-8">
          Results for <span className="text-[#febd69]">"{query}"</span>
          <span className="ml-4 text-sm font-normal text-gray-500">({filtered.length} items found)</span>
        </h3>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#1a1a1a] rounded-3xl border border-dashed border-white/10">
            <span className="text-6xl mb-4">🔍</span>
            <p className="text-gray-400 text-lg">No products match your current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filtered.map((p) => {
              const productId = p._id || p.id;
              return (
                <div 
                  key={productId} 
                  className="group bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#febd69] transition-all duration-300 flex flex-col shadow-xl"
                >
                  <div 
                    className="aspect-[4/3] bg-[#f3f3f3] p-4 flex items-center justify-center cursor-pointer"
                    onClick={() => navigate(`/product/${productId}`)}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 [mix-blend-mode:multiply]"
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h5 className="text-white font-bold text-lg line-clamp-1 group-hover:text-[#febd69] transition-colors">{p.name}</h5>
                      <span className="bg-white/5 text-[10px] text-gray-400 px-2 py-1 rounded uppercase tracking-tighter">{p.category}</span>
                    </div>
                    <p className="text-2xl font-black text-[#febd69] mb-6">₹{p.price}</p>
                    <button
                      className="mt-auto w-full py-3 bg-[#ffa41c] hover:bg-[#ffb347] text-[#111] font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                      onClick={() => addToCart(p)}
                    >
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <button
            className="flex items-center gap-2 text-gray-500 hover:text-white transition font-medium"
            onClick={() => navigate(-1)}
          >
            ← Back to browsing
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchResults;