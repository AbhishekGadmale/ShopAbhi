import React, {createContext,useState} from "react";
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
 return (
    <AuthContext.Provider value={{ user,login,logout}}>
        {children}
    </AuthContext.Provider>
 );
}
 export const useAuth = () =>useContext(AuthContext);