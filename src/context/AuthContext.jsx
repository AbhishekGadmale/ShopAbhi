import React, {createContext,useEffect,useState} from "react";
import { useContext } from "react";
import { API_BASE } from "../api/client";

const AuthContext=createContext();

export function AuthProvider({children}) {
 const [user,setUser]=useState(null);
 const [loading,setLoading]=useState(true);

 const refreshUser = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/users/profile`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
  } catch (err) {
    console.error("Failed to refresh user profile", err);
  }
 };

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
        // After verifying me, fetch full profile with wishlist
        if (data.user) {
          const profileRes = await fetch(`${API_BASE}/api/users/profile`, {
            credentials: "include",
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUser(profileData.user);
          } else {
            setUser(data.user);
          }
        }
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
    <AuthContext.Provider value={{ user,login,logout,loading,refreshUser}}>
        {children}
    </AuthContext.Provider>
 );
}
 export const useAuth = () =>useContext(AuthContext);