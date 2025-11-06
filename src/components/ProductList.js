import React, { useState, useEffect } from "react";
import { Card, Button, Container, Row, Col, Spinner } from "react-bootstrap";
import "./ProductList.css";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <Container  fluid className="mt-4">
      <Row className="product-grid">
        {products.map((product) => (
          <Col key={product.id} md={3} className="product-grid mb-4">
            <Card className="product-card h-100 text-center shadow-sm">
              <Card.Img
                variant="top"
                src={product.image}
                alt={product.title}
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
                  {product.title}
                </Card.Title>
                <div>
                <Card.Text classMName="card-text" style={{ fontSize: "1.1rem" }}>
                  ₹{Math.floor(product.price * 83)}
                </Card.Text>
                <Button variant="warning">Add to Cart</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}