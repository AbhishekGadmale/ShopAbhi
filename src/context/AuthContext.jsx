import React, {createContext,useEffect,useState} from "react";
import { useContext } from "react";
const API_BASE = import.meta.env.VITE_API_BASE || "https://shopabhi-backend.onrender.com";

const AuthContext=createContext();

export function AuthProvider({children}) {
 const [user,setUser]=useState(null);
 const [loading,setLoading]=useState(true);

 const login=(userData)=>{
    setUser(userData);
 };

 const logout = async () => {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    localStorage.removeItem("shop_abhi_cart");
  } catch (err) {
    console.error("Logout error:", err.message);
  }
};
 useEffect(() => {
  const verifySession = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  verifySession();
}, []);

 return (
    <AuthContext.Provider value={{ user,login,logout,loading}}>
        {children}
    </AuthContext.Provider>
 );
}
 export const useAuth = () =>useContext(AuthContext);