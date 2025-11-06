import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AmazonNavbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import Home from "./pages/Home";

function App(){
  return (
    <div>
      <AmazonNavbar />
      <ProductList/>
      <Home/>
    </div>
  );
};

export default App;