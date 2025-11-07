import React, { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

export default function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cartItems")) || [];
    } catch {
      return [];
    }
  });

  // persist to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        // increase quantity
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      // add new with qty 1
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQty = (id) =>
    setCart((prev) => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));

  const decreaseQty = (id) =>
    setCart((prev) => prev.map(i => i.id === id && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i));

  const removeItem = (id) => setCart((prev) => prev.filter(i => i.id !== id));

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      increaseQty,
      decreaseQty,
      removeItem,
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}