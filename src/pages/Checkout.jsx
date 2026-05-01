import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fetchWithAuth } from "../api/client";

function CheckOut() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "cod",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const { cartItems, cartTotal, clearCart } = useCart();
  const [placedOrder, setPlacedOrder] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill all required fields!");
      return;
    }

    const orderData = {
      items: cartItems.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total: cartTotal,
      details: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        paymentMethod: formData.paymentMethod,
      },
    };

    if (formData.paymentMethod === "cod") {
      try {
        const res = await fetchWithAuth("/api/orders", {
          method: "POST",
          body: JSON.stringify(orderData),
        });
        const data = await res.json();
        if (res.status === 201) {
          setPlacedOrder(data.order);
          setOrderPlaced(true);
          clearCart();
        } else {
          alert(data.error || "Failed to place order.");
        }
      } catch (err) {
        alert("Network error. Is the backend running?");
      }
    } else {
      const res = await loadRazorpay();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      try {
        const orderRes = await fetchWithAuth("/api/orders/razorpay", {
          method: "POST",
          body: JSON.stringify({ amount: cartTotal }),
        });
        const orderDataFromBackend = await orderRes.json();

        if (!orderRes.ok) {
          alert("Error creating payment order.");
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderDataFromBackend.order.amount,
          currency: orderDataFromBackend.order.currency,
          name: "ShopAbhi",
          description: "Purchase Payment",
          order_id: orderDataFromBackend.order.id,
          handler: async (response) => {
            const verifyRes = await fetchWithAuth("/api/orders/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: orderData,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setPlacedOrder(verifyData.order);
              setOrderPlaced(true);
              clearCart();
            } else {
              alert(verifyData.error || "Payment verification failed.");
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: { color: "#ffc107" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        alert("Error initiating payment. Please try again.");
      }
    }
  };

  if (orderPlaced && placedOrder) {
    return (
      <div className="max-w-2xl mx-auto bg-[#1a1a1a] p-8 md:p-12 rounded-3xl border border-white/10 text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          ✓
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-400 mb-10">Thank you for shopping with <strong className="text-[#febd69]">ShopAbhi</strong>. Your items will be delivered soon!</p>
        
        <div className="bg-black/20 rounded-2xl p-6 text-left mb-8 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4 uppercase tracking-widest text-xs">Order Summary</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {placedOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-lg p-2 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-grow">
                  <p className="text-white font-medium text-sm line-clamp-1">{item.name}</p>
                  <p className="text-gray-500 text-xs">{item.quantity} x ₹{item.price}</p>
                </div>
                <p className="text-white font-bold">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Total Amount</span>
            <span className="text-2xl font-black text-[#febd69]">₹{placedOrder.total}</span>
          </div>
        </div>
        
        <button 
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10"
          onClick={() => navigate("/")}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 pb-12">
      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-8">Shipping Details</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name *</label>
            <input
              type="text"
              name="name"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number *</label>
            <input
              type="text"
              name="phone"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Delivery Address *</label>
            <textarea
              name="address"
              rows="3"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition resize-none"
              value={formData.address}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Payment Method</label>
            <select
              name="paymentMethod"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition appearance-none"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <option value="cod" className="bg-[#1a1a1a]">Cash on Delivery (COD)</option>
              <option value="card" className="bg-[#1a1a1a]">Credit/Debit Card (Razorpay)</option>
              <option value="upi" className="bg-[#1a1a1a]">UPI / Net Banking (Razorpay)</option>
            </select>
          </div>

          <button type="submit" className="w-full py-4 bg-[#ffa41c] hover:bg-[#ffb347] text-[#111] font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-[#ffa41c]/20 mt-4">
            Confirm & Pay
          </button>
        </form>
      </div>

      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-xl self-start lg:sticky lg:top-28">
        <h2 className="text-xl font-bold text-white mb-6">Your Cart</h2>
        <div className="space-y-4 mb-8">
          {cartItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-gray-400 flex-grow pr-4 truncate">{item.name} <span className="text-gray-600">x{item.quantity}</span></span>
              <span className="text-white font-medium">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex justify-between items-end">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Payable</p>
            <p className="text-3xl font-black text-[#febd69]">₹{cartTotal}</p>
          </div>
          <button onClick={() => navigate("/cart")} className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest border-b border-transparent hover:border-white/20 pb-1">
            Edit Cart
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 flex gap-4">
          <span className="text-2xl">🚚</span>
          <p className="text-xs text-blue-200/60 leading-relaxed">
            Standard free delivery applies to this order. Expected delivery within 3-5 business days.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CheckOut;
