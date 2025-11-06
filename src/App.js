import React,{useState} from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AmazonNavbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import Home from "./pages/Home";

function App(){
  const [cart,setCart]= useState([]);
  const handleAddToCart=(product)=>{

    setCart((prevCart)=>[...prevCart,product]);
  };
  return (
    <div>
      <AmazonNavbar cartCount={cart.length}/>
      <ProductList  handleAddToCart={handleAddToCart}/>
      <Home/>
    </div>
  );
};

export default App;