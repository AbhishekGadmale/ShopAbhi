import React from "react";
import {useParams} from "react-router-dom";
import products from "../data/products";
import {useCart} from "../context/CartContext";

function ProductDetails(){
    const {id}=useParams();
    const{addToCart}=useCart();
    const product=products.find((p)=>p.id===Number(id));
    if (!product){
        return <h2 className="text-light text-center mt-5">Product not Found</h2>;
    }
    return (<div className="container text-light mt-5">
        <div className="row">
        <div className="col-md-6 text-center">
            <img src={product.image}
             alt={product.name}
             style={{width:"100%",maxWidth:"350px",borderRadius:"10px"}}/>
        </div>
        <div className="col-md-6">
            <h2>{product.name}</h2>
            <h3 className="text-warning">₹{product.price}</h3>
            <p className="mt-5">
                This is a high-quality premium product from ShopAbhi.
                Durable,stylish and perfect for daily use.
            </p>
            <button className="btn btn-warning mt-3" onClick={()=>addToCart(product)}>
                Add to Cart
            </button>
        </div>
        </div>
        <button className="btn btn-outline-light mt-3" onClick={() => window.history.back()}>
            Back
           </button>
    </div>
    );
}
export default ProductDetails;
