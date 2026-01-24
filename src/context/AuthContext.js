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
    await fetch("https://shopabhi-backend.onrender.com/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout error:", err);
  }
  localStorage.removeItem("token");
  setUser(null);
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