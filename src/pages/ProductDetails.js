import React from "react";
import {useParams} from "react-router-dom";
import products from "../data/products";
import {useCart} from "../context/CartContext";
import { useNavigate } from "react-router-dom";
function ProductDetails(){
    const {id}=useParams();
    const{addToCart}=useCart();
    const product=products.find((p)=>p.id===Number(id));
    const navigate=useNavigate();
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
             <p><strong>Category:</strong> {product.category}</p>
           {product.description && <p>{product.description}</p>}
           {product.rating && <p>⭐ {product.rating} / 5</p>}
           <h3 className="mt-4">Customer Reviews</h3>
        <ul>
          <li>⭐️⭐️⭐️⭐️ — Great product, worth the price!</li>
          <li>⭐️⭐️⭐️ — Good quality but delivery was late.</li>
        </ul>
            <button className="btn btn-warning mt-3" onClick={()=>addToCart(product)}>
                Add to Cart
            </button>
        </div>
        </div>
        <button className="btn btn-outline-light mt-3" onClick={() => window.history.back()}>
            Back
           </button>
           <h2 className="mt-4">Related Products</h2>
           <div className="row">
            {products.filter(p => p.category === product.category && p.id !==product.id).slice(0,4).map(p=>(
                <div key={p.id} className="col-6 col-md-3 mb-4">
             <div className="card product-card" style={{height: '350px',minWidth:"220px"}} onClick={() => navigate(`/product/${p.id}`)}>
          <img src={p.image} alt={p.name} className="card-img-top" style={{marginTop:"5px"}}/>
          <div className="card-body">
            <h5 className="card-title">{p.name}</h5>
            <span>{p.description}</span>
          <p className="card-text">₹{p.price}</p>
           {p.rating && <p>⭐ {p.rating} / 5</p>}
          </div>
        </div>
      </div>
    ))}
</div>
    </div>
    );
}
export default ProductDetails;
