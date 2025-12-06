import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React,{useRef} from "react";
import "./Home.css";
import ProductList from "../components/ProductList";

 function Home(){
    const sectionRef=useRef(null);
    const scrollTosection=()=>{
        sectionRef.current?.scrollIntoView({behavior:'smooth'});
    };
    return (
       <div>
    {/* Flipkart Style Banner Slider */}
<div className="banner-slider" style={{ marginTop: "10px" }}>
  <Slider
    autoplay
    autoplaySpeed={2500}
    infinite
    dots
    arrows={false}
    slidesToShow={1}
    slidesToScroll={1}
  >
    <div>
      <img src="/images/HeroSlider.png" alt="banner1" />
    </div>
    <div>
      <img src="/images/HeroSlider1.jpg" alt="banner2" />
    </div>
    <div>
      <img src="/images/HeroSlider2.jpg" alt="banner3" />
    </div>
  </Slider>
</div>
       <div className=" home-container text-center">
        <section className="hero"> 
                <div className="hero-content">
                    <h1>Welcome to <span>ShopAbhi</span></h1>
                    <p>Discover amazing deals and latest products today!</p>
                    <button className="shop-btn" onClick={scrollTosection}>Shop Now</button>
                </div>
            </section>
        <ProductList/>
            <section className="featured">
              
                <h2 ref={sectionRef}>Featured Products</h2>
                <div className="product-grid">
                    <div className="product-card">
                        <img src="/images/product1.png" alt="Product 1"/>
                        <h3>Smartwatch</h3>
                        <p>₹1999</p>
                        <button >Add to Cart</button>
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
                      <div className="product-card">
                        <img src="/images/product2.jpg" alt="Product 2"/>
                        <h3>Wireless Earbuds</h3>
                        <p>₹2499</p>
                        <button>Add to Cart</button>
                        </div>
                        
                </div>
            </section>
             {/* Footer Section*/}
      <footer className="footer">
        <p>© 2025 ShopAbhi. All rights reserved.</p>
      </footer>
        </div>
       </div>
    );
};
export default Home;