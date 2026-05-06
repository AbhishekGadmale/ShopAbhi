import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { API_BASE } from "../api/client";

const Signup = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formdata, setFormData] = useState({ email: "", password: "", name: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formdata),
      });

      const data = await response.json();

      if (response.ok) {
        addToast("Signup successful! Please login.", "success");
        navigate("/login");
      } else {
        addToast(data?.error || data?.message || "Signup failed", "error");
      }
    } catch (err) {
      addToast("Signup failed: cannot reach server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white mb-2">Join ShopAbhi</h2>
        <p className="text-gray-500">Create your account to start shopping</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
          <input
            type="text"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition"
            value={formdata.name}
            onChange={(e) => setFormData({ ...formdata, name: e.target.value })}
            required
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email address</label>
          <input
            type="email"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition"
            value={formdata.email}
            onChange={(e) => setFormData({ ...formdata, email: e.target.value })}
            required
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
          <input
            type="password"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition"
            value={formdata.password}
            onChange={(e) => setFormData({ ...formdata, password: e.target.value })}
            required
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-[#ffa41c] hover:bg-[#ffb347] text-[#111] font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-[#ffa41c]/20 disabled:opacity-50"
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-gray-500 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-[#febd69] font-bold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
