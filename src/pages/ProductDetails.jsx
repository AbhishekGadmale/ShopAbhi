import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { fetchWithAuth } from "../api/client";
import { ProductDetailsSkeleton } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import Breadcrumbs from "../components/Breadcrumbs";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart, openMiniCart } = useCart();
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isWishlisted = (productId) => {
    return user?.wishlist?.some(item => (item._id || item.id) === productId);
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      addToast("Please login to use wishlist", "error");
      return;
    }
    try {
      const res = await fetchWithAuth("/api/users/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId: id }),
      });
      if (res.ok) {
        addToast(isWishlisted(id) ? "Removed from wishlist" : "Added to wishlist");
        refreshUser();
      }
    } catch (err) {
      addToast("Failed to update wishlist", "error");
    }
  };

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [totalReviewsPages, setTotalReviewsPages] = useState(1);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchReviews = async (page = 1, shouldAppend = false) => {
    setIsReviewsLoading(true);
    try {
      const res = await fetchWithAuth(`/api/products/${id}/reviews?page=${page}&limit=5`);
      const data = await res.json();
      if (res.ok) {
        setReviews(prev => shouldAppend ? [...prev, ...data.reviews] : data.reviews);
        setTotalReviewsPages(data.pages);
        setReviewsPage(data.page);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setIsReviewsLoading(false);
    }
  };
  
  // High-Fidelity States
  const [selectedColor, setSelectedColor] = useState("Midnight Black");
  const [selectedSize, setSelectedSize] = useState("M");
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${product.image})`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast("Please login to leave a review", "error");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetchWithAuth(`/api/products/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();

      if (res.ok) {
        addToast("Review submitted successfully!");
        setReviewComment("");
        setReviewRating(5);
        // Refresh product and reviews data
        const prodRes = await fetchWithAuth(`/api/products/${id}`);
        const prodData = await prodRes.json();
        if (prodRes.ok) setProduct(prodData.product);
        fetchReviews(1, false);
      } else {
        addToast(data.error || "Failed to submit review", "error");
      }
    } catch (err) {
      addToast("Network error", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth(`/api/products/${id}`);
        const data = await res.json();

        if (res.ok && data.product) {
          setProduct(data.product);
          fetchReviews(1, false);

          const allRes = await fetchWithAuth("/api/products");
          const allData = await allRes.json();
          if (allRes.ok) {
            const related = (allData.products || [])
              .filter((p) => p.category === data.product.category && (p._id || p.id) !== (data.product._id || data.product.id))
              .slice(0, 4);
            setRelatedProducts(related);
          }
        } else {
          setError(data.message || "Product not found");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (isLoading) return <ProductDetailsSkeleton />;
  if (error || !product)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
        <h2 className="text-2xl font-bold mb-4">{error || "Product not found"}</h2>
        <button onClick={() => navigate(-1)} className="text-[#febd69] hover:underline">Go Back</button>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-12">
      <Breadcrumbs 
        customPaths={[
          { name: product.category, routeTo: `/search?q=${product.category}`, isLast: false },
          { name: product.name, routeTo: "", isLast: true }
        ]} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Left: Thumbnail Sidebar (Mocked) */}
        <div className="hidden md:flex md:col-span-1 flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-[#f3f3f3] rounded-lg border-2 border-[#febd69] overflow-hidden cursor-pointer p-2">
              <img src={product.image} className="w-full h-full object-contain mix-blend-multiply" alt="thumb" />
            </div>
          ))}
        </div>

        {/* Center: Main Image with Zoom */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div 
            className="relative bg-[#f3f3f3] rounded-2xl p-6 md:p-10 flex items-center justify-center shadow-2xl cursor-crosshair overflow-hidden group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={product.image}
              className="max-w-full max-h-[450px] object-contain mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0"
              alt={product.name}
            />
            {/* Zoom Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none bg-no-repeat bg-[#f3f3f3]"
              style={{
                ...zoomStyle,
                backgroundSize: "200%",
                mixBlendMode: "multiply"
              }}
            />
            {/* Wishlist Button */}
            <button 
              className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 shadow-lg ${isWishlisted(id) ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/40"}`}
              onClick={handleToggleWishlist}
            >
              {isWishlisted(id) ? "❤️" : "🤍"}
            </button>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="md:col-span-6 flex flex-col gap-6">
          <div className="border-b border-white/10 pb-6">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white flex-grow">{product.name}</h1>
              {product.rating >= 4.5 && (
                <span className="bg-[#febd69] text-[#111] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-tighter ml-4 whitespace-nowrap">
                  Bestseller
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-[#febd69]">₹{product.price}</span>
              <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="text-white font-medium">{product.rating} / 5</span>
                <span className="text-gray-500 text-xs ml-1">({product.numReviews || 0} reviews)</span>
              </div>
            </div>
          </div>

          {/* Color Variations */}
          <div className="space-y-3">
            <p className="text-white font-bold text-sm">Color: <span className="text-gray-400 font-normal">{selectedColor}</span></p>
            <div className="flex gap-3">
              {["#000", "#555", "#febd69"].map((color, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(["Midnight Black", "Space Gray", "Sunset Gold"][i])}
                  className={`w-10 h-10 rounded-full border-2 transition-all p-1 ${selectedColor.includes(i === 0 ? "Black" : i === 1 ? "Gray" : "Gold") ? "border-[#febd69] scale-110" : "border-transparent"}`}
                >
                  <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />
                </button>
              ))}
            </div>
          </div>

          {/* Size Variations */}
          <div className="space-y-3">
            <p className="text-white font-bold text-sm">Size</p>
            <div className="flex gap-2">
              {["S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-5 py-2 rounded-lg border font-bold transition-all ${selectedSize === size ? "bg-[#febd69] border-[#febd69] text-[#111]" : "border-white/10 text-white hover:border-white/30"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Scarcity & Stock */}
          <div className="flex flex-col gap-2">
            <p className={`font-bold text-sm ${product.stock < 10 ? "text-red-500" : "text-green-500"}`}>
              {product.stock < 10 ? `⚠️ Only ${product.stock} left in stock - order soon.` : "✅ In Stock"}
            </p>
            <p className="text-gray-400 text-xs">FREE delivery Monday, May 4. Order within 12 hrs 30 mins.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              className="flex-grow px-10 py-4 bg-[#ffa41c] hover:bg-[#ffb347] text-[#111] font-bold rounded-xl text-lg transition-all active:scale-95 shadow-xl shadow-[#ffa41c]/10"
              onClick={() => {
                addToCart(product);
                openMiniCart();
                addToast(`${product.name} added to cart!`);
              }}
            >
              Add to Cart
            </button>
            <button 
              className="flex-grow px-10 py-4 bg-[#fb923c] hover:bg-[#f97316] text-[#111] font-bold rounded-xl text-lg transition-all active:scale-95"
              onClick={() => navigate("/checkout", { state: { buyNowItem: { ...product, id: product._id || product.id, quantity: 1 } } })}
            >
              Buy Now
            </button>
          </div>

          {/* Professional Guarantees */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { icon: "🛡️", label: "Secure Transaction" },
              { icon: "🚚", label: "Free Delivery" },
              { icon: "🔄", label: "10-Day Replacement" }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-xl mb-1">{badge.icon}</span>
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-tighter leading-tight">{badge.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 p-4 rounded-xl border border-dashed border-white/10 text-gray-400 text-sm italic">
            "This product is covered by our manufacturer warranty and premium support."
          </div>
        </div>
      </div>

      {/* Reviews Section Refined */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10 border-t border-white/10 pt-16">
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">Customer Reviews</h3>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl font-extrabold text-[#febd69]">{Number(product.rating || 0).toFixed(1)}</span>
            <div>
              <div className="text-[#febd69] text-xl">{"★".repeat(Math.floor(product.rating || 0))}{"☆".repeat(5 - Math.floor(product.rating || 0))}</div>
              <p className="text-gray-500 text-sm">Based on {product.numReviews || 0} ratings</p>
            </div>
          </div>
          
          {/* Review Form */}
          {user ? (
            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 mb-8">
              <h4 className="text-white font-bold mb-4">Write a Review</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Rating</label>
                  <select 
                    value={reviewRating} 
                    onChange={(e) => setReviewRating(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#febd69] outline-none"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Comment</label>
                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    rows="3"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#febd69] outline-none resize-none"
                    placeholder="What did you think about this product?"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-3 bg-[#febd69] text-[#111] font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingReview ? "Submitting..." : "Post Review"}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white/5 p-6 rounded-2xl border border-dashed border-white/10 mb-8 text-center">
              <p className="text-gray-400 text-sm mb-4">You must be logged in to post a review.</p>
              <button onClick={() => navigate("/login")} className="text-[#febd69] font-bold hover:underline">Login Now</button>
            </div>
          )}

          <div className="space-y-3 hidden md:block">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = product.ratingDistribution ? product.ratingDistribution[star] : 0;
              const percent = product.numReviews > 0 ? (count / product.numReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-12">{star} star</span>
                  <div className="flex-grow h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#febd69]" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-8">{Math.round(percent)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-white font-bold">Customer Reviews ({product.numReviews || 0})</h4>
            <select className="bg-transparent text-[#febd69] text-sm font-bold border-none focus:ring-0 cursor-pointer">
              <option value="recent">Most Recent</option>
            </select>
          </div>
          
          {reviews && reviews.length > 0 ? (
            <>
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#febd69]/20 flex items-center justify-center text-[#febd69] font-bold">
                      {rev.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{rev.name}</p>
                      <div className="text-[#febd69] text-xs">
                        {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                      </div>
                    </div>
                    <span className="ml-auto text-gray-500 text-[10px]">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{rev.comment}</p>
                </div>
              ))}
              
              {reviewsPage < totalReviewsPages && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => fetchReviews(reviewsPage + 1, true)}
                    disabled={isReviewsLoading}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isReviewsLoading ? "Loading..." : "Load More Reviews"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-gray-500 italic">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const relId = p._id || p.id;
              return (
                <div 
                  key={relId} 
                  className="group bg-[#1a1a1a] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-[#febd69] transition-all"
                  onClick={() => navigate(`/product/${relId}`)}
                >
                  <div className="aspect-square bg-[#f3f3f3] rounded-lg mb-4 flex items-center justify-center p-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform mix-blend-multiply"
                    />
                  </div>
                  <h5 className="text-white font-medium text-sm line-clamp-1 mb-1 group-hover:text-[#febd69]">{p.name}</h5>
                  <p className="text-[#febd69] font-bold">₹{p.price}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
