import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const OrderHistory=()=>{
const {orders}=useCart();
if (orders.length===0){
    return(<p className='text-center text-light mt-5'>No orders yet.</p>);
       }

    return (
        <div className='container mt-5 text-light'>
            <h2 className='mb-4'>Order History</h2>
            {orders.map(order=>(
            <div className='dark bg-dark text-light mb-3' key={order.id}>
                <h4>Order #{order.id}</h4>
                <p><strong>Total : ₹</strong>{order.total}</p>
                <p><strong>Name : </strong>{order.details.name}</p>
                <p><strong>Address : </strong>{order.details.address}</p>
                <ul>
                    {order.items.map((item)=> (
                        <li key={item.id}>
                            {item.name} x {item.quantity} =  ₹{item.price * item.quantity}
                        </li>
                    ))}
                </ul>
         
                </div>
                
            ))}
         <Link to="/"><button className="btn btn-outline-light mt-3" >
            Back
           </button></Link>
        </div>
    )
}
export default OrderHistory;