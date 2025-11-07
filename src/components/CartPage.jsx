import React, { useContext } from "react";
import { Container, Table, Button, Row, Col } from "react-bootstrap";
import { CartContext } from "../context/CartContext";

export default function CartPage() {
  const { cart, increaseQty, decreaseQty, removeItem, cartTotal } = useContext(CartContext);

  return (
    <Container className="my-4">
      <h2 className="mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <Table responsive bordered>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
                <th>Total (₹)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.id}>
                  <td style={{display:"flex", gap:12, alignItems:"center"}}>
                    {item.image && <img src={item.image} alt={item.name} style={{width:60, height:60, objectFit:"contain"}}/>}
                    <div>{item.name}</div>
                  </td>
                  <td>{item.price}</td>
                  <td>
                    <Button variant="outline-danger" size="sm" onClick={() => decreaseQty(item.id)}>-</Button>
                    <span className="mx-2">{item.quantity}</span>
                    <Button variant="outline-success" size="sm" onClick={() => increaseQty(item.id)}>+</Button>
                  </td>
                  <td>{item.price * item.quantity}</td>
                  <td><Button variant="danger" size="sm" onClick={() => removeItem(item.id)}>Remove</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Row className="justify-content-end">
            <Col md={4}>
              <h4 className="text-end">Total: ₹{cartTotal}</h4>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="success">Proceed to Checkout</Button>
              </div>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}