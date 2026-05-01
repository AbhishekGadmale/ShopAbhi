import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useSearch } from "../context/searchBar";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { fetchWithAuth } from "../api/client";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayProducts, setDisplayProducts] = useState([]);

  const Navigate = useNavigate();
  const { addToCart } = useCart();
  const { searchTerm } = useSearch();
  const location = useLocation();
  const isSearchPage = location.pathname.includes("/search");
  const [addedItems, setAddedItems] = useState(new Set());

  const isAdded = (productId) => {
    return addedItems.has(productId);
  };

  useEffect(() => {
    const fetchProducts = async () => {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = isSearchPage
        ? products.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : products;
      setDisplayProducts(filtered);
    }, 300);
    return () => clearTimeout(timer);
  }, [isSearchPage, searchTerm, products]);

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
    return <LoadingSpinner />;
  }

  if (error) {
    return <h3 className="text-white text-center mt-12 text-xl font-semibold">{error}</h3>;
  }

  return (
    <div className="pb-12">
      <h2 className="text-center mb-8 text-2xl font-bold text-[#febd69]">Our Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-2">
        {displayProducts.map((p) => {
          const productId = p._id || p.id;
          return (
            <div key={productId} className="flex h-full">
              <div
                className="group relative flex flex-col justify-between w-full bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden hover:border-[#febd69] transition-all duration-300 shadow-lg hover:shadow-[#febd69]/10 cursor-pointer"
                onClick={() => Navigate(`/product/${productId}`)}
              >
                <div className="aspect-square w-full bg-white p-4 flex items-center justify-center">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h5 className="text-[#ff9900] font-semibold text-sm md:text-base line-clamp-2 min-h-[2.5rem] mb-1">
                    {p.name}
                  </h5>
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
                      setAddedItems((prev) => {
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
      {displayProducts.length === 0 && (
        <div className="text-gray-400 text-center w-full mt-12 py-10 border-2 border-dashed border-white/5 rounded-2xl">
          <p className="text-lg">No products match your search.</p>
        </div>
      )}
    </div>
  );
}

export default ProductList;

