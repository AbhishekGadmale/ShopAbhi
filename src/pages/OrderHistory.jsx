import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api/client";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetchWithAuth("/api/orders");
        const data = await res.json();

        if (res.ok) {
          setOrders(data.orders || []);
        } else {
          setError(data.error || "Failed to fetch orders");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "processing": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "shipped": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-[#febd69] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 font-medium">Loading your orders...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-12 bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
      <p className="text-red-400 font-bold mb-4">Oops! {error}</p>
      <button onClick={() => window.location.reload()} className="text-white bg-red-500 px-6 py-2 rounded-lg font-bold">Try Again</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">Order History</h2>
          <p className="text-gray-500">Track and manage your recent purchases</p>
        </div>
        <Link to="/" className="text-sm font-bold text-[#febd69] hover:underline mb-1">Continue Shopping</Link>
      </div>

      {!orders.length ? (
        <div className="bg-[#1a1a1a] rounded-3xl border border-dashed border-white/10 p-16 text-center">
          <span className="text-6xl mb-6 block">📦</span>
          <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-8">Your shopping history will appear here once you place an order.</p>
          <button onClick={() => navigate("/")} className="bg-[#ffa41c] text-[#111] px-8 py-3 rounded-xl font-bold transition-all active:scale-95">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-xl" key={order.id || order._id}>
              {/* Order Header */}
              <div className="bg-white/5 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-white/5">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order Placed</p>
                    <p className="text-white text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-white text-sm font-bold">₹{order.total}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
                  <p className="text-gray-400 text-[10px] font-mono">{(order.id || order._id).toUpperCase()}</p>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-6 flex flex-col md:flex-row gap-8">
                <div className="flex-grow space-y-6">
                  {(order.items || order.products || []).map((item, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="w-16 h-16 bg-white rounded-lg p-2 flex-shrink-0">
                         {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-contain" />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h5 className="text-white font-bold text-sm truncate hover:text-[#febd69] transition cursor-pointer">{item.name}</h5>
                        <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity} • ₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="md:w-48 flex-shrink-0 flex flex-col gap-4">
                  <div className={`px-4 py-2 rounded-full border text-center text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status || "Processing"}
                  </div>
                  <div className="p-4 bg-black/20 rounded-xl space-y-2">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Ship To</p>
                    <p className="text-white text-xs leading-tight font-medium">{order.details?.name}</p>
                    <p className="text-gray-500 text-[10px] leading-tight line-clamp-2">{order.details?.address}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;