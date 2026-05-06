import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fetchWithAuth } from "../api/client";

const STEPS = ["Address", "Delivery", "Payment", "Review"];

function CheckOut() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [verifiedTotal, setVerifiedTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isLoadingTotal, setIsLoadingTotal] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const res = await fetchWithAuth("/api/orders/validate-coupon", {
        method: "POST",
        body: JSON.stringify({ code: couponCode, cartTotal: subtotal })
      });
      const data = await res.json();
      if (res.ok) {
        setDiscount(data.discount);
        setAppliedCoupon(data.code);
        setVerifiedTotal(subtotal - data.discount);
        addToast("Coupon applied successfully!", "success");
      } else {
        addToast(data.error || "Invalid coupon", "error");
      }
    } catch (err) {
      addToast("Failed to validate coupon", "error");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setDiscount(0);
    setVerifiedTotal(subtotal);
  };

  const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: defaultAddress?.phone || "",
    address: defaultAddress?.street || "",
    city: defaultAddress?.city || "",
    pincode: defaultAddress?.zipCode || "",
    deliveryOption: "standard",
    paymentMethod: "cod",
  });

  const handleSelectAddress = (addr) => {
    setFormData({
      ...formData,
      phone: addr.phone || "",
      address: addr.street,
      city: addr.city,
      pincode: addr.zipCode,
    });
  };

  const [orderPlaced, setOrderPlaced] = useState(false);
  const { selectedItems, fetchCart } = useCart();
  const [placedOrder, setPlacedOrder] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const checkoutItems = useMemo(() => {
    return location.state?.buyNowItem ? [location.state.buyNowItem] : selectedItems;
  }, [location.state, selectedItems]);

  // Redirect if no items are selected
  React.useEffect(() => {
    if (checkoutItems.length === 0 && !orderPlaced) {
      navigate("/cart");
    }
  }, [checkoutItems, navigate, orderPlaced]);

  // Fetch verified total from backend
  React.useEffect(() => {
    if (checkoutItems.length > 0 && currentStep === 3) {
      const getVerifiedTotal = async () => {
        setIsLoadingTotal(true);
        try {
          const res = await fetchWithAuth("/api/orders/preview", {
            method: "POST",
            body: JSON.stringify({
              items: checkoutItems.map(item => ({ id: item.id || item._id, quantity: item.quantity })),
              couponCode: appliedCoupon
            })
          });
          const data = await res.json();
          if (res.ok) {
            setVerifiedTotal(data.total);
            setSubtotal(data.subtotal);
            setDiscount(data.discount);
          } else {
            addToast(data.error || "Failed to verify total with server.", "error");
          }
        } catch (err) {
          console.error("Error verifying total", err);
        } finally {
          setIsLoadingTotal(false);
        }
      };
      getVerifiedTotal();
    }
  }, [checkoutItems, currentStep, appliedCoupon]);

  const finalTotal = verifiedTotal + (formData.deliveryOption === 'express' ? 99 : 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
    if (currentStep === 0) {
      if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
        addToast("Please fill all required address fields", "error");
        return;
      }
      if (formData.phone.replace(/\D/g, '').length < 10) {
        addToast("Please enter a valid 10-digit phone number", "error");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async () => {
    const minimalItems = checkoutItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }));

    const orderDetails = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
      paymentMethod: formData.paymentMethod,
      deliveryOption: formData.deliveryOption,
    };

    if (formData.paymentMethod === "cod") {
      try {
        const res = await fetchWithAuth("/api/orders", {
          method: "POST",
          body: JSON.stringify({ 
            items: minimalItems, 
            details: orderDetails,
            idempotencyKey,
            couponCode: appliedCoupon
          }),
        });
        const data = await res.json();
        if (res.status === 201 || res.status === 200) {
          setPlacedOrder(data.order);
          setOrderPlaced(true);
          if (!location.state?.buyNowItem) {
            await fetchCart(); 
          }
        } else {
          addToast(data.error || "Failed to place order.", "error");
        }
      } catch (err) {
        addToast("Network error. Is the backend running?", "error");
      }
    } else {
      const res = await loadRazorpay();
      if (!res) {
        addToast("Razorpay SDK failed to load. Are you online?", "error");
        return;
      }

      try {
        const orderRes = await fetchWithAuth("/api/orders/razorpay", {
          method: "POST",
          body: JSON.stringify({ 
            items: minimalItems,
            details: orderDetails,
            idempotencyKey,
            couponCode: appliedCoupon
          }),
        });
        const orderDataFromBackend = await orderRes.json();

        if (!orderRes.ok) {
          addToast(orderDataFromBackend.error || "Error creating payment order.", "error");
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
                localOrderId: orderDataFromBackend.localOrderId
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setPlacedOrder(verifyData.order);
              setOrderPlaced(true);
              if (!location.state?.buyNowItem) {
                await fetchCart(); 
              }
            } else {
              addToast(verifyData.error || "Payment verification failed.", "error");
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
        addToast("Error initiating payment. Please try again.", "error");
      }
    }
  };

  if (orderPlaced && placedOrder) {
    return (
      <div className="max-w-2xl mx-auto bg-[#1a1a1a] p-8 md:p-12 rounded-3xl border border-white/10 text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
        <h2 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h2>
        <p className="text-gray-400 mb-10">Thank you for your purchase. Your order ID is <span className="text-[#febd69]">#{placedOrder._id?.slice(-8).toUpperCase()}</span></p>
        <button className="w-full py-4 bg-[#ffa41c] text-[#111] font-bold rounded-xl transition-all" onClick={() => navigate("/")}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Stepper */}
      <div className="mb-12 max-w-3xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-[#febd69] -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${idx <= currentStep ? "bg-[#febd69] text-[#111] scale-110 shadow-lg shadow-[#febd69]/20" : "bg-[#232f3e] text-gray-500"}`}>
                {idx < currentStep ? "✓" : idx + 1}
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${idx <= currentStep ? "text-white" : "text-gray-600"}`}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Step Content */}
        <div className="lg:col-span-2 space-y-8 bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-xl">
          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-white mb-8">Shipping Address</h2>
              
              {/* Saved Addresses Selector */}
              {user?.addresses?.length > 0 && (
                <div className="mb-10">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Saved Addresses</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => (
                      <button 
                        key={addr._id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-4 rounded-xl border text-left transition-all ${formData.address === addr.street ? "border-[#febd69] bg-[#febd69]/5" : "border-white/5 bg-white/5 hover:border-white/20"}`}
                      >
                        <p className="text-white font-bold text-sm mb-1">{user.name} {addr.isDefault && <span className="text-[8px] bg-[#febd69] text-[#111] px-1 rounded ml-2">DEFAULT</span>}</p>
                        <p className="text-gray-400 text-xs line-clamp-1">{addr.street}</p>
                        <p className="text-gray-500 text-[10px]">{addr.city}, {addr.state} {addr.zipCode}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name *</label>
                  <input type="text" name="name" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition" value={formData.name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number *</label>
                  <input type="text" name="phone" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email (Optional)</label>
                  <input type="email" name="email" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition" value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Street Address *</label>
                  <textarea name="address" rows="2" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition resize-none" value={formData.address} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">City *</label>
                  <input type="text" name="city" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition" value={formData.city} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Pincode *</label>
                  <input type="text" name="pincode" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#febd69] transition" value={formData.pincode} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-white mb-8">Delivery Method</h2>
              <div className="space-y-4">
                {[
                  { id: "standard", title: "Standard Delivery", desc: "Delivered in 3-5 business days", price: "FREE" },
                  { id: "express", title: "Express Delivery", desc: "Delivered in 1-2 business days", price: "₹99" }
                ].map((opt) => (
                  <label key={opt.id} className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.deliveryOption === opt.id ? "border-[#febd69] bg-[#febd69]/5 shadow-lg shadow-[#febd69]/5" : "border-white/5 hover:border-white/20 bg-white/5"}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="deliveryOption" value={opt.id} checked={formData.deliveryOption === opt.id} onChange={handleChange} className="w-5 h-5 accent-[#febd69]" />
                      <div>
                        <p className="text-white font-bold">{opt.title}</p>
                        <p className="text-gray-500 text-xs">{opt.desc}</p>
                      </div>
                    </div>
                    <span className="text-[#febd69] font-black">{opt.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-white mb-8">Payment Details</h2>
              <div className="space-y-4">
                {[
                  { id: "cod", title: "Cash on Delivery", desc: "Pay when you receive the product", icon: "💵" },
                  { id: "card", title: "Card / UPI / NetBanking", desc: "Secure payment via Razorpay", icon: "💳" }
                ].map((opt) => (
                  <label key={opt.id} className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === opt.id ? "border-[#febd69] bg-[#febd69]/5 shadow-lg shadow-[#febd69]/5" : "border-white/5 hover:border-white/20 bg-white/5"}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="paymentMethod" value={opt.id} checked={formData.paymentMethod === opt.id} onChange={handleChange} className="w-5 h-5 accent-[#febd69]" />
                      <div className="text-2xl">{opt.icon}</div>
                      <div>
                        <p className="text-white font-bold">{opt.title}</p>
                        <p className="text-gray-500 text-xs">{opt.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-white mb-8">Review Order</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h4 className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Ship to</h4>
                  <p className="text-white font-medium">{formData.name}</p>
                  <p className="text-gray-400 text-sm">{formData.address}, {formData.city} - {formData.pincode}</p>
                  <p className="text-gray-400 text-sm">Phone: {formData.phone}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Payment & Delivery</h4>
                  <p className="text-white font-medium">{formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                  <p className="text-gray-400 text-sm uppercase">{formData.deliveryOption} Delivery</p>
                </div>
              </div>
            </div>
          )}

          {/* Nav Buttons */}
          <div className="flex justify-between pt-8 border-t border-white/10 mt-8">
            <button 
              className={`px-8 py-3 rounded-xl font-bold transition-all ${currentStep === 0 ? "opacity-0 pointer-events-none" : "text-white hover:bg-white/5 border border-white/10"}`}
              onClick={prevStep}
            >
              Back
            </button>
            {currentStep < STEPS.length - 1 ? (
              <button 
                className="px-10 py-3 bg-[#febd69] text-[#111] font-bold rounded-xl shadow-lg shadow-[#febd69]/10 active:scale-95 transition-all"
                onClick={nextStep}
              >
                Next Step
              </button>
            ) : (
              <button 
                className="px-10 py-3 bg-[#ffa41c] text-[#111] font-bold rounded-xl shadow-lg shadow-[#ffa41c]/20 active:scale-95 transition-all disabled:opacity-50"
                onClick={handleSubmit}
                disabled={isLoadingTotal}
              >
                {isLoadingTotal ? "Verifying..." : `Place Order (₹${finalTotal})`}
              </button>
            )}
          </div>
        </div>

        {/* Sticky Summary */}
        <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-xl lg:sticky lg:top-28">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Order Summary</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {checkoutItems.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-lg p-1 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-white text-xs font-medium truncate">{item.name}</p>
                  <p className="text-gray-500 text-[10px]">{item.quantity} x ₹{item.price}</p>
                </div>
                <p className="text-white font-bold text-xs">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          {/* Coupon Code Section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Promo Code</label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-[#febd69]/10 border border-[#febd69]/20 p-3 rounded-xl">
                <div>
                  <p className="text-[#febd69] font-bold text-xs">{appliedCoupon}</p>
                  <p className="text-[10px] text-green-500">Coupon Applied!</p>
                </div>
                <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-white transition">✕</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#febd69]"
                />
                <button 
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || !couponCode}
                  className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold px-4 rounded-xl border border-white/10 transition-all disabled:opacity-50"
                >
                  {isValidatingCoupon ? "..." : "Apply"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-3 pt-6 border-t border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-white">₹{isLoadingTotal ? "..." : subtotal || "0"}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-500">Discount</span>
                <span className="text-green-500">- ₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span className="text-green-500">{formData.deliveryOption === 'express' ? '+ ₹99' : 'FREE'}</span>
            </div>
            <div className="flex justify-between items-end pt-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
              <span className="text-3xl font-black text-[#febd69]">₹{isLoadingTotal ? "..." : finalTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckOut;
