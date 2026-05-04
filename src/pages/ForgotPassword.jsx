import React, { useState } from "react";
import { fetchWithAuth } from "../api/client";
import { useToast } from "../context/ToastContext";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetchWithAuth("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message || "Reset link sent to your email!");
      } else {
        addToast(data.message || "Failed to send reset link", "error");
      }
    } catch (err) {
      addToast("Network error. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-[#1a1a1a] rounded-3xl border border-white/10 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
      <p className="text-gray-400 text-sm mb-8">Enter your email address and we'll send you a link to reset your password.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
          <input 
            required
            type="email" 
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#febd69] outline-none transition"
          />
        </div>
        
        <button 
          disabled={isLoading}
          type="submit"
          className="w-full py-4 bg-[#febd69] text-[#111] font-bold rounded-xl active:scale-95 transition shadow-lg shadow-[#febd69]/10 disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link to="/login" className="text-[#febd69] text-sm font-bold hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
