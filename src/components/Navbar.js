import React from "react";
import { Navbar, Container, Form, FormControl, Button, Nav } from "react-bootstrap";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import "./Navbar.css";

export default function AmazonNavbar({cartCount}) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="px-3">
      <Container fluid>
        <Navbar.Brand href="#" style={{ fontWeight: "bold", color: "#ff9900" }}>
          ShopAbhi
        </Navbar.Brand>

        <Form className="d-flex mx-auto w-50">
          <FormControl
            type="search"
            placeholder="Search for products..."
            className="me-2"
            aria-label="Search"
          />
          <Button variant="warning">Search</Button>
        </Form>

        <Nav>
          <Button variant="outline-light" className="me-2">
            <FaUser /> Login
          </Button>
          <Button variant="warning">
            <FaShoppingCart /> Cart ({cartCount}) 
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}