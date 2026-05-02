import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../api/client";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "https://shopabhi-backend.onrender.com";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetchWithAuth("/api/admin/stats"),
        fetchWithAuth("/api/admin/orders"),
        fetchWithAuth("/api/products?limit=100")
      ]);

      if (statsRes.ok) setStats((await statsRes.json()).stats);
      if (ordersRes.ok) setOrders((await ordersRes.json()).orders);
      if (productsRes.ok) setProducts((await productsRes.json()).products);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetchWithAuth(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetchWithAuth(`/api/admin/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
      }
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  if (loading) return <div className="text-white text-center py-20">Loading Admin Panel...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
        <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-white/10">
          {["overview", "products", "orders"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === tab ? "bg-[#febd69] text-[#111]" : "text-gray-400 hover:text-white"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: "💰", color: "text-green-500" },
            { label: "Total Orders", value: stats.orders, icon: "📦", color: "text-blue-500" },
            { label: "Total Products", value: stats.products, icon: "🏷️", color: "text-[#febd69]" },
            { label: "Total Users", value: stats.users, icon: "👥", color: "text-purple-500" }
          ].map((s, i) => (
            <div key={i} className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/10 shadow-xl">
              <div className="text-3xl mb-4">{s.icon}</div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "products" && (
        <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Products Management</h2>
            <button className="bg-[#febd69] text-[#111] px-4 py-2 rounded-lg font-bold text-sm">Add Product</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-bold">Product</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold">Price</th>
                  <th className="px-6 py-4 font-bold">Stock</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} className="w-10 h-10 object-contain bg-white rounded-lg p-1" alt="" />
                        <span className="text-white font-medium text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{p.category}</td>
                    <td className="px-6 py-4 text-[#febd69] font-bold text-sm">₹{p.price}</td>
                    <td className="px-6 py-4 text-white text-sm">{p.stock}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition">✏️</button>
                        <button onClick={() => deleteProduct(p._id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Orders Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-bold">Order ID</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map(o => (
                  <tr key={o._id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-gray-400 text-xs font-mono">#{o._id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium">{o.userId?.name || "Guest"}</p>
                      <p className="text-gray-500 text-[10px]">{o.userId?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-white font-bold text-sm">₹{o.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        o.status === "Delivered" ? "bg-green-500/10 text-green-500" :
                        o.status === "Cancelled" ? "bg-red-500/10 text-red-500" :
                        "bg-[#febd69]/10 text-[#febd69]"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                        className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#febd69]"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
