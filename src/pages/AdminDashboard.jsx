import React, { useState, useEffect } from "react";
import { fetchWithAuth, API_BASE } from "../api/client";
import { useNavigate } from "react-router-dom";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from "recharts";

const COLORS = ["#febd69", "#4ade80", "#60a5fa", "#f87171", "#a78bfa"];

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    description: "",
    stock: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, catsRes] = await Promise.all([
        fetchWithAuth("/api/admin/stats"),
        fetchWithAuth("/api/admin/orders"),
        fetchWithAuth("/api/products?limit=100"),
        fetchWithAuth("/api/admin/categories")
      ]);

      if (statsRes.ok) setStats((await statsRes.json()).stats);
      if (ordersRes.ok) setOrders((await ordersRes.json()).orders);
      if (productsRes.ok) setProducts((await productsRes.json()).products);
      if (catsRes.ok) setCategories((await catsRes.json()).categories);
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
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetchWithAuth(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      alert("Error deleting product");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      stock: product.stock
    });
    setShowProductModal(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      price: "",
      image: "",
      category: categories[0]?.name || "",
      description: "",
      stock: ""
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct._id}` 
        : "/api/admin/products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(productForm)
      });

      if (res.ok) {
        const data = await res.json();
        if (editingProduct) {
          setProducts(products.map(p => p._id === editingProduct._id ? data.product : p));
        } else {
          setProducts([data.product, ...products]);
        }
        setShowProductModal(false);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to save product");
      }
    } catch (err) {
      alert("Error saving product");
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category? Products using it will remain but without a valid category reference.")) return;
    try {
      const res = await fetchWithAuth(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) setCategories(categories.filter(c => c._id !== id));
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  const addCategory = async () => {
    const name = prompt("Enter new category name:");
    if (!name) return;
    try {
      const res = await fetchWithAuth("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const data = await res.json();
        setCategories([...categories, data.category].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      alert("Failed to add category");
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetchWithAuth("/api/admin/reviews");
      if (res.ok) {
        setReviews((await res.json()).reviews);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await fetchWithAuth(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) setReviews(reviews.filter(r => r._id !== id));
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const updateReviewStatus = async (id, status) => {
    try {
      const res = await fetchWithAuth(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReviews(reviews.map(r => r._id === id ? { ...r, status } : r));
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    if (activeTab === "reviews") fetchReviews();
  }, [activeTab]);

  if (loading) return <div className="text-white text-center py-20">Loading Admin Panel...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
        <div className="flex flex-wrap justify-center bg-[#1a1a1a] p-1 rounded-xl border border-white/10">
          {["overview", "products", "orders", "categories", "reviews"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === tab ? "bg-[#febd69] text-[#111]" : "text-gray-400 hover:text-white"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {activeTab === "overview" && stats && (
              <>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {/* Revenue Trend */}
                  <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6">Revenue Trend (30 Days)</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.dailyRevenue}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="_id" stroke="#666" fontSize={10} tickFormatter={(val) => val.split("-").slice(1).join("/")} />
                          <YAxis stroke="#666" fontSize={10} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "12px" }}
                            itemStyle={{ color: "#febd69", fontWeight: "bold" }}
                          />
                          <Line type="monotone" dataKey="revenue" stroke="#febd69" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6">Order Status Distribution</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.statusDistribution}
                            dataKey="count"
                            nameKey="_id"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                          >
                            {stats.statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                             contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "12px" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-6">Top Selling Products</h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                        <XAxis type="number" stroke="#666" fontSize={10} />
                        <YAxis dataKey="name" type="category" stroke="#fff" fontSize={10} width={120} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "12px" }}
                           itemStyle={{ color: "#febd69" }}
                        />
                        <Bar dataKey="totalSold" fill="#febd69" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

      {activeTab === "products" && (
        <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Products Management</h2>
            <button 
              onClick={handleAddProduct}
              className="bg-[#febd69] text-[#111] px-4 py-2 rounded-lg font-bold text-sm"
            >
              + Add Product
            </button>
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
                        <button 
                          onClick={() => handleEditProduct(p)}
                          className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => deleteProduct(p._id)} 
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                        >
                          🗑️
                        </button>
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
      {activeTab === "categories" && (
        <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Categories Management</h2>
            <button onClick={addCategory} className="bg-[#febd69] text-[#111] px-4 py-2 rounded-lg font-bold text-sm">+ Add Category</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-bold">Category Name</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map(c => (
                  <tr key={c._id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-white font-medium">{c.name}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => deleteCategory(c._id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Review Moderation</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Product</th>
                  <th className="px-6 py-4 font-bold">Rating</th>
                  <th className="px-6 py-4 font-bold">Comment</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reviews.map(r => (
                  <tr key={r._id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium">{r.name}</p>
                      <p className="text-gray-500 text-[10px]">{r.user?.email || "User Account"}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm truncate max-w-[150px]">{r.product?.name || "Deleted Product"}</td>
                    <td className="px-6 py-4 text-[#febd69] font-bold">{"★".repeat(r.rating)}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm italic">"{r.comment}"</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        r.status === "approved" ? "bg-green-500/10 text-green-500" :
                        r.status === "rejected" ? "bg-red-500/10 text-red-500" :
                        "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {r.status || "approved"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {r.status !== "approved" && (
                          <button onClick={() => updateReviewStatus(r._id, "approved")} className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition" title="Approve">✅</button>
                        )}
                        {r.status !== "rejected" && (
                          <button onClick={() => updateReviewStatus(r._id, "rejected")} className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition" title="Reject">🚫</button>
                        )}
                        <button onClick={() => deleteReview(r._id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-white">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white transition">✕</button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Product Name</label>
                <input 
                  required
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#febd69] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Price (₹)</label>
                <input 
                  required
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#febd69] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Stock Quantity</label>
                <input 
                  required
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#febd69] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Category</label>
                <select 
                  required
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#febd69] outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name} className="bg-[#1a1a1a]">{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Image URL</label>
                <input 
                  required
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#febd69] outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Description</label>
                <textarea 
                  required
                  rows="4"
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#febd69] outline-none resize-none"
                />
              </div>
              <div className="md:col-span-2 flex gap-4 mt-4">
                <button 
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-grow py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-grow py-4 bg-[#febd69] text-[#111] font-bold rounded-xl active:scale-95 transition shadow-lg shadow-[#febd69]/10"
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
