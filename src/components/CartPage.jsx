import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";

function CartPage() {
  const navigate = useNavigate();
  const selectAllRef = React.useRef(null);
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    selectedTotal,
    clearCart,
    toggleItemSelection,
    selectAllItems,
    isItemSelected,
    selectedItemIds,
  } = useCart();

  const isAllSelected = cartItems.length > 0 && selectedItemIds.length === cartItems.length;
  const isPartiallySelected = selectedItemIds.length > 0 && selectedItemIds.length < cartItems.length;

  React.useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-32 h-32 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/50 border border-white/5">
          <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Your cart is empty</h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">Looks like you haven't added anything to your cart yet. Explore our products and find something you love!</p>
        <button 
          onClick={() => navigate("/products")}
          className="bg-[#febd69] hover:bg-[#f3a847] text-[#111] font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#febd69]/20"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Shopping Cart</h2>
        <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Column: Cart Items */}
        <div className="xl:col-span-2 space-y-4">
          {/* Header Action Bar */}
          <div className="bg-[#1a1a1a] p-4 sm:px-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                ref={selectAllRef}
                checked={isAllSelected}
                onChange={(e) => selectAllItems(e.target.checked)}
                className="w-5 h-5 accent-[#febd69] cursor-pointer rounded bg-white/10 border-white/20"
                id="selectAll"
              />
              <label htmlFor="selectAll" className="text-white font-medium cursor-pointer select-none">
                Select All Items
              </label>
            </div>
            <button 
              onClick={clearCart}
              className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
            >
              Clear Cart
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className={`bg-[#1a1a1a] p-4 sm:p-6 rounded-2xl border transition-all duration-300 shadow-md flex gap-4 sm:gap-6 items-center ${isItemSelected(item.id) ? "border-[#febd69]/50 shadow-[#febd69]/5 bg-[#febd69]/5" : "border-white/5"}`}>
                
                {/* Checkbox */}
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isItemSelected(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="w-5 h-5 accent-[#febd69] cursor-pointer rounded bg-white/10 border-white/20"
                  />
                </div>

                {/* Product Image */}
                <div 
                  className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-xl p-2 flex-shrink-0 cursor-pointer border border-white/10 overflow-hidden group"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Product Details */}
                <div className="flex-grow min-w-0 flex flex-col justify-between h-full py-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                    <div className="cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                      <h3 className="text-white font-medium text-sm sm:text-base line-clamp-2 hover:text-[#febd69] transition-colors">{item.name}</h3>
                      <p className="text-gray-500 text-xs mt-1 capitalize">{item.category || "Product"}</p>
                    </div>
                    <p className="text-white font-bold text-lg sm:text-xl whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
                    {/* Quantity Control */}
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-1">
                      <button 
                        onClick={() => decreaseQuantity(item.id)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        &minus;
                      </button>
                      <span className="w-8 text-center text-white font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => increaseQuantity(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-md transition-colors"
                      >
                        &#43;
                      </button>
                    </div>

                    {/* Remove Action */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-500 hover:text-red-400 p-2 transition-colors rounded-lg hover:bg-red-400/10 flex items-center gap-2 text-sm font-medium"
                      title="Remove Item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="xl:sticky xl:top-28 mt-8 xl:mt-0">
          <div className="bg-[#1a1a1a] p-6 sm:p-8 rounded-3xl border border-white/5 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Selected Items ({selectedItemIds.length})</span>
                <span className="text-white font-medium">₹{selectedTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery</span>
                <span className="text-green-500 font-medium">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-gray-300 font-medium">Subtotal</span>
                <span className="text-3xl font-black text-[#febd69]">
                  ₹{selectedTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              className="w-full py-4 bg-[#ffa41c] hover:bg-[#ffb347] text-[#111] font-bold rounded-xl shadow-lg shadow-[#ffa41c]/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
              onClick={() => navigate("/checkout")}
              disabled={selectedItemIds.length === 0}
            >
              Proceed to Checkout
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>

            {selectedItemIds.length === 0 && (
              <p className="text-red-400 text-xs text-center mt-4 font-medium">
                Please select at least one item to checkout.
              </p>
            )}
            
            <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wider">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;