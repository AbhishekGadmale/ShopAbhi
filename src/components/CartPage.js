import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    cartTotal,
    clearCart,
  } = useCart();

  return (
    <div className="container mt-5">
      <h2 className="text-center text-light mb-4">Your Cart</h2>

      {cartItems.length === 0 ? (
        <><p className="text-center text-muted">Your cart is empty.</p><button className="btn btn-outline-light mt-3" onClick={() => window.history.back()}>
          Back
        </button></>
      ) : (
        <>
          {/* Table Section */}
          <table className="table table-dark table-hover text-center">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
                <th>Total (₹)</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>
                    <button
                     disabled={item.quantity <=1} onClick={() => decreaseQuantity(item.id)}
                      className="btn btn-sm btn-outline-light mx-1"
                    >
                      -
                    </button>
                    {item.quantity}
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="btn btn-sm btn-outline-light mx-1"
                    >
                      +
                    </button>
                  </td>
                  <td>₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                  <td>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

              <tr>
                <td colSpan="3" className="text-end fw-bold">
                  Total:
                </td>
                <td colSpan="2" className="fw-bold text-warning">
                 ₹{cartTotal.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ✅ Checkout button outside table */}
          <div className="text-end">
            <button
              className="btn btn-success mt-3"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
            <button className="btn btn-danger mt-3" onClick={clearCart}>Clear Cart</button>
            
          </div>
             <button className="btn btn-outline-light mt-3" onClick={() => window.history.back()}>
            Back
           </button>
        </>
      )}
    </div>
  );
}

export default CartPage;