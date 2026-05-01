import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const MiniCart = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, removeFromCart, increaseQuantity, decreaseQuantity } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-[10005] backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#131921] z-[10006] shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-white/10 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#232f3e]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🛒 Shopping Cart <span className="text-sm font-normal text-gray-400">({cartItems.length} items)</span>
            </h2>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
          </div>

          {/* Items List */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <span className="text-6xl opacity-20">🛒</span>
                <p className="text-gray-400">Your cart is empty</p>
                <button 
                  onClick={onClose}
                  className="text-[#febd69] hover:underline font-bold"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-20 h-20 bg-[#f3f3f3] rounded-lg p-2 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-white font-medium text-sm line-clamp-2 mb-1 group-hover:text-[#febd69] transition-colors">{item.name}</h4>
                    <p className="text-[#febd69] font-bold mb-2">₹{item.price}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-white/5">
                        <button onClick={() => decreaseQuantity(item.id)} className="px-3 py-1 text-white hover:bg-white/10">-</button>
                        <span className="px-3 py-1 text-white text-xs border-x border-white/10">{item.quantity}</span>
                        <button onClick={() => increaseQuantity(item.id)} className="px-3 py-1 text-white hover:bg-white/10">+</button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#232f3e] space-y-4">
              <div className="flex justify-between items-center text-white">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-2xl font-bold text-[#febd69]">₹{cartTotal}</span>
              </div>
              <p className="text-[10px] text-gray-500 text-center italic">Shipping and taxes calculated at checkout</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { navigate('/cart'); onClose(); }}
                  className="w-full py-3 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition"
                >
                  View Cart
                </button>
                <button 
                  onClick={() => { navigate('/checkout'); onClose(); }}
                  className="w-full py-3 bg-[#ffa41c] hover:bg-[#ffb347] text-[#111] font-bold rounded-xl shadow-lg shadow-[#ffa41c]/10 transition"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MiniCart;
