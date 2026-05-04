import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../api/client";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formdata, setFormdata] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formdata),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.user); // update context
        navigate("/");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white mb-2">Welcome Back</h2>
        <p className="text-gray-500">Log in to your ShopAbhi account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email address</label>
          <input
            type="email"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition"
            value={formdata.email}
            onChange={(e) => setFormdata({ ...formdata, email: e.target.value })}
            required
            placeholder="john@example.com"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <Link to="/forgot-password"  className="text-[10px] font-bold text-[#febd69] hover:underline uppercase tracking-widest">Forgot?</Link>
          </div>
          <input
            type="password"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition"
            value={formdata.password}
            onChange={(e) => setFormdata({ ...formdata, password: e.target.value })}
            required
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-4 bg-[#ffa41c] hover:bg-[#ffb347] text-[#111] font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-[#ffa41c]/20 disabled:opacity-50"
        >
          {isLoading ? "Signing In..." : "Log In"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-gray-500 text-sm">
          New to ShopAbhi?{" "}
          <Link to="/signup" className="text-[#febd69] font-bold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
