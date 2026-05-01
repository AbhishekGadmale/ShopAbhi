import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, { useRef } from "react";
import ProductList from "../components/ProductList";

function Home() {
  const sectionRef = useRef(null);
  const scrollTosection = () => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sliderSettings = {
    autoplay: true,
    autoplaySpeed: 4000,
    infinite: true,
    dots: true,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Banner Slider */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/5">
        <Slider {...sliderSettings}>
          {[
            "/images/HeroSlider.png",
            "/images/HeroSlider1.jpg",
            "/images/HeroSlider2.jpg"
          ].map((src, idx) => (
            <div key={idx} className="relative aspect-[21/9] md:aspect-[3/1]">
              <img src={src} alt={`banner${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1111] via-transparent to-transparent opacity-60" />
            </div>
          ))}
        </Slider>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 text-center">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Welcome to <span className="text-[#febd69]">ShopAbhi</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
            Experience the ultimate shopping journey. Discover premium electronics, 
            trending accessories, and unbeatable deals curated just for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              className="px-8 py-3 bg-[#ffa41c] hover:bg-[#ffb347] text-[#111] font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-[#ffa41c]/20"
              onClick={scrollTosection}
            >
              Start Shopping
            </button>
            <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-full border border-white/10 transition-all">
              View Deals
            </button>
          </div>
        </div>
      </section>

      {/* Product List Section */}
      <div ref={sectionRef} className="scroll-mt-32">
        <ProductList />
      </div>

      {/* Trust Badges */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-12 border-y border-white/5">
        {[
          { icon: "🚚", title: "Fast Delivery", desc: "Across all of India" },
          { icon: "🛡️", title: "Secure Payment", desc: "100% Protected" },
          { icon: "🔄", title: "Easy Returns", desc: "7-day policy" },
          { icon: "📞", title: "24/7 Support", desc: "Always here to help" }
        ].map((item, i) => (
          <div key={i} className="text-center p-4">
            <span className="text-4xl mb-3 block">{item.icon}</span>
            <h4 className="text-white font-bold mb-1">{item.title}</h4>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-white/5 text-center">
        <div className="flex justify-center gap-6 mb-6">
          <span className="text-gray-400 hover:text-[#febd69] cursor-pointer transition">About Us</span>
          <span className="text-gray-400 hover:text-[#febd69] cursor-pointer transition">Contact</span>
          <span className="text-gray-400 hover:text-[#febd69] cursor-pointer transition">Privacy Policy</span>
        </div>
        <p className="text-gray-500 text-sm italic">© 2026 ShopAbhi. Designed for the modern shopper.</p>
      </footer>
    </div>
  );
}

export default Home;