import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fetchWithAuth } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth(`/api/products/${id}`);
        const data = await res.json();

        if (res.ok && data.product) {
          setProduct(data.product);

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

  if (isLoading) return <LoadingSpinner />;
  if (error || !product)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
        <h2 className="text-2xl font-bold mb-4">{error || "Product not found"}</h2>
        <button onClick={() => navigate(-1)} className="text-[#febd69] hover:underline">Go Back</button>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Product Image */}
        <div className="bg-white rounded-2xl p-6 md:p-10 flex items-center justify-center shadow-2xl">
          <img
            src={product.image}
            className="max-w-full max-h-[400px] object-contain"
            alt={product.name}
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div className="border-b border-white/10 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-[#febd69]">₹{product.price}</span>
              {product.rating !== undefined && (
                <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white font-medium">{product.rating} / 5</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-400">
              <strong className="text-white">Category:</strong> {product.category}
            </p>
            {product.description && (
              <div className="text-gray-300 leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Customer Reviews</h3>
            <div className="space-y-4">
              <div className="border-l-2 border-[#febd69] pl-4">
                <p className="text-yellow-400 text-sm">⭐️⭐️⭐️⭐️</p>
                <p className="text-white text-sm mt-1 italic">"Great product, worth the price!"</p>
              </div>
              <div className="border-l-2 border-white/20 pl-4">
                <p className="text-yellow-400 text-sm">⭐️⭐️⭐️</p>
                <p className="text-white text-sm mt-1 italic">"Good quality but delivery was late."</p>
              </div>
            </div>
          </div>

          <button
            className="w-full md:w-auto px-10 py-4 bg-[#ffa41c] hover:bg-[#ffb347] text-[#111] font-bold rounded-xl text-lg transition-all active:scale-95 shadow-xl shadow-[#ffa41c]/10"
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-start">
        <button
          className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
          onClick={() => navigate(-1)}
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to Results
        </button>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const relId = p._id || p.id;
              return (
                <div 
                  key={relId} 
                  className="group bg-[#1a1a1a] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-[#febd69] transition-all"
                  onClick={() => navigate(`/product/${relId}`)}
                >
                  <div className="aspect-square bg-white rounded-lg mb-4 flex items-center justify-center p-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform"
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
