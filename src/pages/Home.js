import React from "react";
import "./Home.css";

 function Home(){
    return (
       
       
       <div className="home">
       
            <section className="hero"> 
                <div classname="hero-content">
                    <h1>Welcome to <span>ShopAbhi</span></h1>
                    <p>Discover amazing deals and latest products today!</p>
                    <button classname="shop-btn">Shop Now</button>
                </div>
            </section>
        
            <section className="featured">
                <h2>Featured Products</h2>
                <div className="product-grid">
                    <div className="product-card">
                        <img src="/images/product1.png" alt="Product 1"/>
                        <h3>Smartwatch</h3>
                        <p>₹1999</p>
                        <button>Add to Cart</button>
                    </div>
                    <div className="product-card">
                        <img src="/images/product2.jpg" alt="Product 2"/>
                        <h3>Wireless Earbuds</h3>
                        <p>₹2499</p>
                        <button>Add to Cart</button>
                    </div>
                    <div className="product-card">
                        <img src="/images/product3.jpg" alt="Product 3"/>
                        <h3>Bluetooth Speaker</h3>
                        <p>₹1499</p>
                        <button>Add to Cart</button>
                    </div>
                </div>
            </section>
             {/* Footer Section*/}
      <footer className="footer">
        <p>© 2025 ShopAbhi. All rights reserved.</p>
      </footer>
        </div>
       
    );
};
export default Home;