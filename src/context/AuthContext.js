import React, {createContext,useEffect,useState} from "react";
import { useContext } from "react";
const AuthContext=createContext();
export function AuthProvider({children}) {
 const [user,setUser]=useState(null);
 const login=(email,password)=>{
    setUser({email,password})
 };
 const logout =()=>{
    setUser(null);
 };
 useEffect(()=>{
   const token= localStorage.getItem("token");
   if(token){
      setUser({ email: "persistedUser" }); 
   }
 },[])
 return (
    <AuthContext.Provider value={{ user,login,logout}}>
        {children}
    </AuthContext.Provider>
 );
}
 export const useAuth = () =>useContext(AuthContext);