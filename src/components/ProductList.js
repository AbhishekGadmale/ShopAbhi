import React from "react";
import { Card, Button, Container, Row, Col, Spinner } from "react-bootstrap";
import "./ProductList.css";
import products from "../data/products";

 export default function ProductList({handleAddToCart}){
  

  return (
    <Container  className="mt-4">
      <Row className="product-grid justify-content-center">
        {products.map((product) => (
          <Col key={product.id} md={3} className="product-grid mb-4">
            <Card className="product-card h-100 text-center shadow-sm">
              <Card.Img
                variant="top"
                src={product.image}
                alt={product.Name}
                style={{
                  height: "180px",
                  objectFit: "contain",
                  backgroundColor: "#f8f9fa",
                  padding: "8px",
                  borderRadius:"8px"
                }}
              />
              <Card.Body>
                <Card.Title className="card-title"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    minHeight: "50px",
                  }}
                >
                  {product.Name}
                </Card.Title>
                <div>
                <Card.Text className="card-text" style={{ fontSize: "1.1rem" }}>
                  {"₹"+product.price} 
                </Card.Text>
                <Button variant="warning" onClick={()=> handleAddToCart(product)}>Add to Cart</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

