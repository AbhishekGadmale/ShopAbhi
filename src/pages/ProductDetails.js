import React from "react";
import {useParams} from "react-router-dom";
import products from "../data/products";
import {useCart} from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./ProductDetails.css";
function ProductDetails(){
    const {id}=useParams();
    const{addToCart}=useCart();
    const product=products.find((p)=>p.id===Number(id));
    const navigate=useNavigate();
    if (!product){
        return <h2 className="text-light text-center mt-5">Product not Found</h2>;
    }
    return (<div className="container product-details-page text-light mt-4 mt-md-5">
        <div className="row product-details-main g-4 align-items-start">
        <div className="col-md-6 text-center">
          <div className="product-image-wrap">
            <img src={product.image}
             className="product-main-image"
             alt={product.name}
             />
          </div>
        </div>
        <div className="col-md-6">
          <div className="product-info-panel">
            <h2 className="product-title">{product.name}</h2>
            <h3 className="product-price">₹{product.price}</h3>
            <p className="product-meta"><strong>Category:</strong> {product.category}</p>
            {product.description && <p className="product-description">{product.description}</p>}
            {product.rating && <p className="product-rating">⭐ {product.rating} / 5</p>}
            <h3 className="reviews-title mt-4">Customer Reviews</h3>
        <ul className="reviews-list">
          <li>⭐️⭐️⭐️⭐️ — Great product, worth the price!</li>
          <li>⭐️⭐️⭐️ — Good quality but delivery was late.</li>
        </ul>
            <button className="btn btn-warning mt-3 add-cart-btn" onClick={()=>addToCart(product)}>
                Add to Cart
            </button>
          </div>
        </div>
        </div>
        <button className="btn btn-outline-light mt-3 back-btn" onClick={() => window.history.back()}>
            Back
           </button>
           <h2 className="mt-4 related-title">Related Products</h2>
           <div className="row g-4 related-grid">
            {products.filter(p => p.category === product.category && p.id !==product.id).slice(0,4).map(p=>(
                <div key={p.id} className="col-6 col-md-4 col-lg-3 d-flex">
             <div className="card related-card" onClick={() => navigate(`/product/${p.id}`)}>
          <img src={p.image} alt={p.name} className="card-img-top related-card-image"/>
          <div className="card-body related-card-body">
            <h5 className="card-title related-card-title">{p.name}</h5>
            <p className="related-card-description">{p.description}</p>
          <p className="card-text related-card-price">₹{p.price}</p>
           {p.rating && <p className="related-card-rating">⭐ {p.rating} / 5</p>}
          </div>
        </div>
      </div>
    ))}
</div>
    </div>
    );
}
export default ProductDetails;
