import React, { createContext,useEffect, useState, useMemo, useContext } from "react";

export const CartContext=createContext();

export function CartProvider({ children }) {
const clearCart = () => setCartItems([]);
const [orders,setOrders]=useState(()=>{
  const savedOrders=localStorage.getItem("orders");
  return savedOrders ? JSON.parse(savedOrders) : [];
});

   const [cartItems, setCartItems] = useState(()=>{
    try{
    const savedCart=localStorage.getItem("cartItems");
    return savedCart? JSON.parse(savedCart):[];
   } catch {
      return [];
    }
});
  

  function addToCart(product) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const increaseQuantity = (productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

useEffect(()=>{
    localStorage.setItem("cartItems",JSON.stringify(cartItems));
  },[cartItems]);

const placeOrder=(orderDetails)=>{
const newOrder={
  id:Date.now(),
  items:cartItems,
  total:cartTotal,
  details:orderDetails,
};
setOrders((prev)=> [...prev,newOrder]);
setCartItems([]);
}

useEffect(() => {
  localStorage.setItem("orders", JSON.stringify(orders));
}, [orders]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        cartCount,
        cartTotal,
        clearCart,
        orders,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ✅ Custom hook (easy use in components)
export const useCart = () => useContext(CartContext);