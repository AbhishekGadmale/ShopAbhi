import React, { useState } from "react";
import "./Checkout.css";
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
  const { cartItems, cartTotal } = useCart();
 //const {placeOrder}=useCart();
 const [placedOrder,setPlacedOrder]=useState(null);

// On success:
// clearCart();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
const token= localStorage.getItem("token");
    // Basic validation
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill all required fields!");
      return;
    }
    if (formData.paymentMethod==="upi"){
      alert("UPI payment method is currently unavailable. Please choose another method.");
      return;
    }
    
    if(!token){
      alert("You Must be Logged in to place an Order")
      return;
    }
    const orderData={
      items:cartItems.map(item=>({
        name:item.name,
        price:item.price,
        quantity:item.quantity,
        image:item.image
      })),
      total:cartTotal,
      details:{
        name:formData.name,
         email: formData.email,
      phone: formData.phone,
      address: formData.address,
      paymentMethod: formData.paymentMethod,
      },
    };

    try {
      const res = await fetchWithAuth("/api/auth/orders", {
  method: "POST",
  body: JSON.stringify(orderData),
});

      const data= await res.json();
       
      if (res.status === 201) {
      setPlacedOrder(data.order);   // backend returns saved order
      setOrderPlaced(true);
      setFormData({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "cod",
  });
      // Optionally clear cart here
      // clearCart();
    } else {
      alert(data.error || "Failed to place order.");
    }
  } catch (err) {
    alert("Network error. Is the backend running?");
  }
// Reset form
  
  };
 

  if (orderPlaced && placedOrder) {
    
   
    return (
     
      <div className="order-success">
        <h2>🎉 Order Placed Successfully!</h2>
        <p>Thank you for shopping with <strong>ShopAbhi</strong>.</p>
        <p>Your items will be delivered soon!</p>
        <div className="card-header bg-light">
      <h2 className="mb-0">Order Summary</h2>

      {placedOrder && placedOrder.items.map((item,idx) => (
  <div key={idx} className="order-item order-summary">
    <p><strong>{item.name}</strong></p>
    {item.name && <img src={item.image} alt={item.name} style={{width:"100px",height:"100px",objectFit:"contain"}}/>}
    <p>Price: ₹{item.price}</p>
    <p>Quantity: {item.quantity}</p>
    <p>Subtotal: ₹{item.price * item.quantity}</p>
    <hr />
  </div>
))}
         <h3>Total: ₹{placedOrder.total}</h3>
       
        </div>
         <button className="btn btn-outline-light mt-1" onClick={() => window.history.back()}>
             Back
         </button>
      </div>
    );
  }
 
  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email (optional)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone *</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Address *</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
          >
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="upi">UPI / Wallet</option>
            <option value="card">Credit/Debit Card</option>
          </select>
        </div>

        <button type="submit" className="btn btn-success w-100">
          Place Order
        </button>
      </form>
        <button className="btn btn-outline-light mt-3" onClick={() => window.history.back()}>
            Back
           </button>
    </div>
 )};



export default CheckOut;
