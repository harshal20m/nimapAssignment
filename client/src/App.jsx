import React, { useState } from "react";
import CategoryMaster from "./components/CategoryMaster";
import ProductMaster from "./components/ProductMaster";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="App">
      <header className="app-header">
        <h1>Product Management System</h1>
      </header>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          Category Master
        </button>
        <button
          className={`tab-button ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Product Master
        </button>
      </div>

      <div className="content">
        {activeTab === "categories" && <CategoryMaster />}
        {activeTab === "products" && <ProductMaster />}
      </div>
    </div>
  );
}

export default App;
