import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
 
  function Login(){

    
    const {login}=useAuth();
    const navigate= useNavigate();
    const [formdata,setFormdata]=useState({email:"",password:""});
     const handleSubmit=async(e)=>{
           e.preventDefault();
      
    

         const response = await fetch("http://13.48.193.189:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify(formdata)
});
const data = await response.json();
if (response.ok) {
  localStorage.setItem("token", data.token);
  login(data, data.token); // update context
  navigate("/");
} else {
  alert(data.error);
}
    };
   


    return (
        <div className="container mt-5 text-light">
            <form onSubmit={handleSubmit} className="w-50 mx-auto">
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label> 
                    <input type="email" className="form-control" value={formdata.email} onChange={(e)=>setFormdata({...formdata,email:e.target.value} )} required/>
                    </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" value={formdata.password} onChange={(e)=>setFormdata({...formdata,password:e.target.value} )} required/>
                </div>
                <button type="submit" className="btn btn-warning w-100">Login</button>
            </form>
      
        </div>
    )
}

export default Login;