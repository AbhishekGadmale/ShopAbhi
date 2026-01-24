import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";
const Signup = ()=>{

    const {login}=useAuth();
    const navigate=useNavigate();
    const[formdata,setFormData]= useState({email:"",password:"",name:""});
    const handleSubmit=async(e)=>{
        e.preventDefault();
       

         const response = await fetch("https://shopabhi-backend.onrender.com/api/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: formdata.name, email: formdata.email, password: formdata.password })
});
const data = await response.json();
if (response.ok) {
  localStorage.setItem("token", data.token);
  login(data.user || data.token); // simulate login after signup
  navigate("/");
} else {
  alert(data.error);
}
    };
    



    
    return (
        <div className="container mt-5 text-light">
            <h2>Signup Page</h2>
            <form onSubmit={handleSubmit} className="w-50 mx-auto">
                <div className="mb-3">
                    <label>Name</label>
                    <input type="text" className="form-control" value={formdata.name} onChange={(e)=>setFormData({...formdata,name:e.target.value})} required />
                </div>
                <div className="mb-3">
                    <label>Email</label>
                    <input type="email" className="form-control" value={formdata.email} onChange={(e)=>setFormData({...formdata,email:e.target.value})} required />
                </div>
                <div className="mb-3">
                    <label>Password</label>
                    <input type="password" className="form-control" value={formdata.password} onChange={(e)=>setFormData({...formdata,password:e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-warning w-100">Signup</button>
            </form>
        </div>
    )
}
export default Signup;