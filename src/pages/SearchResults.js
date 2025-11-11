import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import products from "../data/products";
import { useCart } from "../context/CartContext";
import "./SearchResults.css";

function SearchResults() {
  const { search } = useLocation();
  const query = new URLSearchParams(search).get("q")?.toLowerCase() || "";
  const { addToCart } = useCart();

  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const priceRanges = [
    { label: "Under ₹1000", min: 0, max: 1000 },
    { label: "₹1000 - ₹3000", min: 1000, max: 3000 },
    { label: "₹3000 - ₹5000", min: 3000, max: 5000 },
    { label: "₹5000+", min: 5000, max: Infinity },
  ];

  const categories = ["Electronics", "Accessories", "Fashion", "Food", "Beauty"];

  const togglePrice = (label) => {
    setSelectedPrices((prev) =>
      prev.includes(label)
        ? prev.filter((r) => r !== label)
        : [...prev, label]
    );
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query);

    const matchesPrice =
      selectedPrices.length === 0 ||
      selectedPrices.some((label) => {
        const range = priceRanges.find((r) => r.label === label);
        return p.price >= range.min && p.price <= range.max;
      });

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.category);

    return matchesQuery && matchesPrice && matchesCategory;
  });

  return (
    <div className="search-page">
      <div className="sidebar">
        <h5>Filters</h5>

        <div className="filter-section">
          <label className="filter-title">Price Range</label>
          {priceRanges.map((r) => (
            <div key={r.label}>
              <input
                type="checkbox"
                checked={selectedPrices.includes(r.label)}
                onChange={() => togglePrice(r.label)}
              />{" "}
              {r.label}
            </div>
          ))}
        </div>

        <div className="filter-section">
          <label className="filter-title">Category</label>
          {categories.map((c) => (
            <div key={c}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(c)}
                onChange={() => toggleCategory(c)}
              />{" "}
              {c}
            </div>
          ))}
        </div>
      </div>

      <div className="results-container">
        <h3 className="text-light mb-4">
          Results for: <span className="text-warning">{query}</span>
        </h3>

        {filtered.length === 0 ? (
          <p className="text-muted">No products found.</p>
        ) : (
          <div className="results-grid">
            {filtered.map((p) => (
              <div key={p.id} className="result-card">
                <img src={p.image} alt={p.name} className="result-img" />
                <div className="result-info">
                  <h5>{p.name}</h5>
                  <p className="price">₹{p.price}</p>
                  <p className="category-text">{p.category}</p>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => addToCart(p)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;