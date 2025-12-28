import {useEffect, useState} from "react";
import { useCart } from "../context/CartContext";
import "./ProductList.css";
import products from "../data/products";
import { useSearch } from "../context/searchBar";
import { useLocation } from "react-router-dom";
import { useNavigate }  from "react-router-dom";
import LoadingSpinner  from "./LoadingSpinner";
// const products = [
//   { id: 1, name: "Smart Watch", price: 2999, image: "/images/smartwatch.jpg" },
//   { id: 2, name: "Headphones", price: 1999, image: "/images/wirelessheadphone.jpg" },
//   { id: 3, name: "Speaker", price: 1499, image: "/images/speaker.jpg" },
//   { id: 4, name: "Snacks", price: 999, image: "/images/snacks.jpg" },
// ];


function ProductList() {
const [isLoading,setIsLoading]=useState(true);
const [displayProducts,setDisplayProducts]=useState([]);

  const Navigate=useNavigate();
  const{ addToCart } = useCart();
  const {searchTerm}=useSearch();
  console.log("Loaded Products",products)
  const location=useLocation();
  const isSearchPage=location.pathname.includes("/search");
  const[addedItems,setAddedItems]=useState(new Set());

  const isAdded=(productId)=>{
    return addedItems.has(productId);
  }
  useEffect(()=>{
    setIsLoading(true);
    const timer=setTimeout(()=>{
      const filtered = isSearchPage? products.filter((product)=> product.name.toLowerCase().includes(searchTerm.toLowerCase())):products;
      setDisplayProducts(filtered);
      setIsLoading(false);

    },800);
    return()=> clearTimeout(timer);
  },[isSearchPage,searchTerm]);

  //const filteredProducts= isSearchPage? products.filter((product)=>product.name.toLowerCase().includes(searchTerm.toLowerCase())):products;
const flyToCartAnimation=(img)=>{
  const cart=document.querySelector(".cart-icon-target");
  if (!cart || !img) return;
  const imgRect=img.getBoundingClientRect();
  const cartRect=cart.getBoundingClientRect();
const clone=img.cloneNode(true);
clone.style.position="fixed";
clone.style.left=imgRect.left+"px";
clone.style.top=imgRect.top+"px";
clone.style.width=imgRect.width+"px";
clone.style.height=imgRect.height+"px";
clone.style.transition="all 0.7s ease-in-out";
clone.style.zIndex="9999";
clone.style.objectFit="contain";
document.body.appendChild(clone);

requestAnimationFrame(()=>{
  clone.style.left=cartRect.left+"px";
  clone.style.top=cartRect.top+"px";
  clone.style.width="20px";
  clone.style.height="20px";
  clone.style.opacity="0.2";
});
setTimeout(()=> clone.remove(),800);
};


if (isLoading){
  return <LoadingSpinner/>;
}

  return (
    <div>
      <h2 className="text-center mb-4 text-light">Our Products</h2>
      <div className="row">
   
        {displayProducts.map((p) => (
          <div key={p.id} className="col-6 col-md-3 mb-4">
            <div className="section">
            <div className="card text-center product-card" style={{cursor:"pointer"}} 
            onClick={()=> Navigate(`/product/${p.id}`)}>
              <img
                src={p.image}
                alt={p.name}
                className="card-img-top"
                style={{height:170 ,  objectFit: "cover" }}
              />
              <div className="card-body ">
                <h5 className="mt-2">{p.name}</h5>
                <p className="fw-bold">₹{p.price}</p>
                <button className="btn btn-warning w-100 add-to-cart-btn"
                  onClick={(e) => {
                    const img=e.target.closest(".product-card").querySelector("img");
                    flyToCartAnimation(img);
                    e.stopPropagation();
                    addToCart(p);
                  setAddedItems(prev => {
                            const next = new Set(prev);
                                      next.add(p.id);
                                  return next;
                                      });
                  }
                }
                >
                 {isAdded(p.id)? 'Added to Cart✅':'Add to Cart'} 
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
