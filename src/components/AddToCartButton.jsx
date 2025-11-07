import React,{useContext,useState} from "react";
import {Button} from "react-bootstrap";
import {CartContext} from "../context/CartContext";

export default function AddToCartButton ({product}){
    const {addToCart}=useContext(CartContext);
    const [added,setAdded]=useState(false);
    const handle=()=>{
        addToCart(product);
        setAdded(true);
        setTimeout(()=>setAdded(false),900);
    };
    return (
        <Button variant={added ? "success" : "warning"} onClick={handle}>
            {added?"Added ✓":"Add to Cart"}
        </Button>
    );
}