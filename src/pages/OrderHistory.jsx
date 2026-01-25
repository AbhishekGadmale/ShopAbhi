import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        const res = await fetch("https://shopabhi-backend.onrender.com/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          // Adjust mapping if your backend shape is different
          setOrders(data.orders || []);
        } else {
          setError(data.error || "Failed to fetch orders");
        }
      } catch (err) {
        setError("Network error. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="text-center text-light mt-5">Loading orders...</p>;
  if (error) return <p className="text-center text-light mt-5">Error: {error}</p>;
  if (!orders.length) return <p className="text-center text-light mt-5">No orders yet.</p>;

  return (
    <div className="container mt-5 text-light">
      <h2 className="mb-4">Order History</h2>

      {orders.map((order) => (
        <div className="bg-dark text-light p-3 mb-3 rounded" key={order.id || order._id}>
          <h4>Order #{order.id || order._id}</h4>
          <p><strong>Total: ₹</strong>{order.total}</p>
          {order.details && (
            <>
              <p><strong>Name: </strong>{order.details.name}</p>
              <p><strong>Address: </strong>{order.details.address}</p>
            </>
          )}
          <ul>
            {(order.items || order.products || []).map((item) => (
              <li key={item.id || item._id}>
                {item.name} x {item.quantity} = ₹{item.price * item.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <Link to="/">
        <button className="btn btn-outline-light mt-3">Back</button>
      </Link>
    </div>
  );
};

export default OrderHistory;