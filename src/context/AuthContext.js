import React, {createContext,useEffect,useState} from "react";
import { useContext } from "react";
const AuthContext=createContext();
export function AuthProvider({children}) {
 const [user,setUser]=useState(null);
 const [loading,setLoading]=useState(true);
 const login=(userData,accessToken)=>{
   localStorage.setItem("token",accessToken);
    setUser(userData);
 };
 const logout = async () => {
  try {
    const res = await fetch("https://shopabhi-backend.onrender.com/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // eslint-disable-next-line no-undef
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
     if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }

    const data = await res.json();
    localStorage.setItem("token", data.accessToken);
    setUser(data.user);
  } catch (err) {
    console.error("Login error:", err.message);
  }
};

 useEffect(()=>{
   const token= localStorage.getItem("token");
   if(token){
      setUser({ loggedIn: true }); 
   }
   setLoading(false);
 },[])


 return (
    <AuthContext.Provider value={{ user,login,logout,loading}}>
        {children}
    </AuthContext.Provider>
 );
}
 export const useAuth = () =>useContext(AuthContext);