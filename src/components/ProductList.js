import React from "react";
import { useCart } from "../context/CartContext";
import "./ProductList.css";
import products from "../data/products";
import { useSearch } from "../context/searchBar";
// const products = [
//   { id: 1, name: "Smart Watch", price: 2999, image: "/images/smartwatch.jpg" },
//   { id: 2, name: "Headphones", price: 1999, image: "/images/wirelessheadphone.jpg" },
//   { id: 3, name: "Speaker", price: 1499, image: "/images/speaker.jpg" },
//   { id: 4, name: "Snacks", price: 999, image: "/images/snacks.jpg" },
// ];

function ProductList() {
  const { addToCart } = useCart();
  const {searchTerm}=useSearch();
  console.log("Loaded Products",products)

  const filteredProducts=products.filter((product)=>product.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div>
      <h2 className="text-center mb-4 text-light">Our Products</h2>
      <div className="row">
   
        {filteredProducts.map((p) => (
          <div key={p.id} className="col-md-3 mb-4">
            <div className="section">
            <div className="card text-center product-card">
              <img
                src={p.image}
                alt={p.name}
                className="card-img-top"
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body ">
                <h5 className="card-title">{p.name}</h5>
                <p className="card-text">₹{p.price}</p>
                <button
                  onClick={() => addToCart(p)}
                  className="btn btn-warning"
                >
                  Add to Cart
                </button>
                
              </div>
             
            </div>
           </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;