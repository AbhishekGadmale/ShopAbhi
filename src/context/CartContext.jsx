import React, { createContext, useEffect, useState, useMemo, useContext, useCallback } from "react";
import { fetchWithAuth } from "../api/client";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

const CART_STORAGE_KEY = "shop_abhi_cart";
const MIGRATION_KEY = "cart_migration_done";

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const openMiniCart = () => setIsMiniCartOpen(true);
  const closeMiniCart = () => setIsMiniCartOpen(false);

  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem("orders");
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  // Unified state for cart and selection
  const [cartState, setCartState] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);

      // Migration from old key (runs only once)
      const migrationDone = localStorage.getItem(MIGRATION_KEY);
      if (!migrationDone) {
        const oldCart = localStorage.getItem("cartItems");
        if (oldCart) {
          const items = JSON.parse(oldCart);
          localStorage.removeItem("cartItems");
          localStorage.setItem(MIGRATION_KEY, "true");
          return { items, selectedIds: [] };
        }
      }

      return { items: [], selectedIds: [] };
    } catch {
      return { items: [], selectedIds: [] };
    }
  });

  const cartItems = cartState.items;
  const selectedItemIds = cartState.selectedIds;

  // Persist to localStorage and handle multi-tab sync
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
  }, [cartState]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        setCartState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Fetch cart from backend if authenticated
  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetchWithAuth("/api/cart");
      const data = await res.json();
      if (res.ok) {
        setCartState(prev => ({
          ...prev,
          items: data.cart
        }));
      }
    } catch (err) {
      console.error("Failed to fetch cart from backend", err);
    }
  }, [user]);

  // Sync cart to backend whenever items change
  useEffect(() => {
    if (!user) return;
    const syncTimeout = setTimeout(async () => {
      try {
        await fetchWithAuth("/api/cart/sync", {
          method: "POST",
          body: JSON.stringify({
            cartItems: cartItems.map(item => ({ id: item.id, quantity: item.quantity }))
          })
        });
      } catch (err) {
        console.error("Failed to sync cart to backend", err);
      }
    }, 1000); // Debounce sync

    return () => clearTimeout(syncTimeout);
  }, [cartItems, user]);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  // Derived state
  const selectedItems = useMemo(
    () => cartItems.filter((item) => selectedItemIds.includes(item.id)),
    [cartItems, selectedItemIds]
  );

  const selectedTotal = useMemo(
    () => selectedItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [selectedItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  // Selection cleanup
  useEffect(() => {
    setCartState((prev) => {
      const validIds = prev.items.map((item) => item.id);
      const updatedSelectedIds = prev.selectedIds.filter((id) => validIds.includes(id));
      if (updatedSelectedIds.length !== prev.selectedIds.length) {
        return { ...prev, selectedIds: updatedSelectedIds };
      }
      return prev;
    });
  }, [cartItems]);

  const addToCart = (product) => {
    const productId = product.id || product._id;
    setCartState((prev) => {
      const existing = prev.items.find((item) => (item.id || item._id) === productId);
      let newItems;
      if (existing) {
        newItems = prev.items.map((item) =>
          (item.id || item._id) === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newItems = [...prev.items, { ...product, id: productId, quantity: 1 }];
      }
      return { ...prev, items: newItems };
    });
  };

  const removeFromCart = (productId) => {
    setCartState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== productId),
    }));
  };

  const increaseQuantity = (productId) => {
    setCartState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }));
  };

  const decreaseQuantity = (productId) => {
    setCartState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  const clearCart = () => setCartState({ items: [], selectedIds: [] });

  const toggleItemSelection = (productId) => {
    setCartState((prev) => {
      const isSelected = prev.selectedIds.includes(productId);
      const newSelectedIds = isSelected
        ? prev.selectedIds.filter((id) => id !== productId)
        : [...prev.selectedIds, productId];
      return { ...prev, selectedIds: newSelectedIds };
    });
  };

  const selectAllItems = (isSelectAll) => {
    setCartState((prev) => ({
      ...prev,
      selectedIds: isSelectAll ? prev.items.map((item) => item.id) : [],
    }));
  };

  const isItemSelected = (productId) => selectedItemIds.includes(productId);

  const clearSelection = () => {
    setCartState((prev) => ({ ...prev, selectedIds: [] }));
  };

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedItems,
        selectedItemIds,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        cartCount,
        cartTotal,
        selectedTotal,
        clearCart,
        orders,
        fetchCart,
        isMiniCartOpen,
        openMiniCart,
        closeMiniCart,
        toggleItemSelection,
        selectAllItems,
        isItemSelected,
        clearSelection,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ✅ Custom hook (easy use in components)
export const useCart = () => useContext(CartContext);