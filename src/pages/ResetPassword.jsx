import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api/client";
import { useToast } from "../context/ToastContext";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return addToast("Passwords do not match", "error");
    }

    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`/api/auth/reset-password/${token}`, {
        method: "PATCH",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("Password reset successful!");
        navigate("/login");
      } else {
        addToast(data.message || "Token is invalid or expired", "error");
      }
    } catch (err) {
      addToast("Network error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-[#1a1a1a] rounded-3xl border border-white/10 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-2">Set New Password</h2>
      <p className="text-gray-400 text-sm mb-8">Please enter your new password below.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">New Password</label>
          <input 
            required
            minLength={6}
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#febd69] outline-none transition"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Confirm Password</label>
          <input 
            required
            minLength={6}
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#febd69] outline-none transition"
          />
        </div>
        
        <button 
          disabled={isLoading}
          type="submit"
          className="w-full py-4 bg-[#febd69] text-[#111] font-bold rounded-xl active:scale-95 transition shadow-lg shadow-[#febd69]/10 disabled:opacity-50"
        >
          {isLoading ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
