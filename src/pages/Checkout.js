import React, { useState } from "react";
import "./Checkout.css";

 function CheckOut() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "cod",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill all required fields!");
      return;
    }

    // Simulate order success
    setOrderPlaced(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      paymentMethod: "cod",
    });
  };

  if (orderPlaced) {
    return (
      <div className="checkout-success">
        <h2>🎉 Order Placed Successfully!</h2>
        <p>Thank you for shopping with <strong>ShopAbhi</strong>.</p>
        <p>Your items will be delivered soon!</p>
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
    </div>
  );
}

export default CheckOut;