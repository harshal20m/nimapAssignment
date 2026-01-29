import React, { useState } from "react";
import CategoryMaster from "./components/CategoryMaster";
import ProductMaster from "./components/ProductMaster";

function App() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Product Management System
          </h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white border rounded-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-6 py-3 font-medium ${
                activeTab === "categories"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Category Master
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-3 font-medium ${
                activeTab === "products"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Product Master
            </button>
          </div>

          <div className="p-6">
            {activeTab === "categories" && <CategoryMaster />}
            {activeTab === "products" && <ProductMaster />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
