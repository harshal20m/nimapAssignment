import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://nimapassignment.onrender.com/api";

function ProductMaster() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    product_name: "",
    description: "",
    price: "",
    category_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts(pagination.currentPage, pagination.pageSize);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories" + err);
    }
  };

  const fetchProducts = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`, {
        params: { page, pageSize },
      });

      setProducts(response.data.products);
      setPagination(response.data.pagination);
      setError("");
    } catch (err) {
      setError("Failed to fetch products" + err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product_name.trim() || !formData.category_id) {
      setError("Product name and category are required");
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`${API_URL}/products/${editingId}`, formData);
        setSuccess("Product updated successfully");
      } else {
        await axios.post(`${API_URL}/products`, formData);
        setSuccess("Product created successfully");
      }

      setFormData({
        product_name: "",
        description: "",
        price: "",
        category_id: "",
      });
      setEditingId(null);
      setError("");
      fetchProducts(pagination.currentPage, pagination.pageSize);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      product_name: product.product_name,
      description: product.description || "",
      price: product.price || "",
      category_id: product.category_id,
    });
    setEditingId(product.product_id);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/products/${id}`);
      setSuccess("Product deleted successfully");

      if (products.length === 1 && pagination.currentPage > 1) {
        fetchProducts(pagination.currentPage - 1, pagination.pageSize);
      } else {
        fetchProducts(pagination.currentPage, pagination.pageSize);
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      product_name: "",
      description: "",
      price: "",
      category_id: "",
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handlePageChange = (newPage) => {
    fetchProducts(newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    fetchProducts(1, newPageSize);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Product Management</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-gray-50 border rounded p-4 mb-6">
        <h3 className="font-medium mb-3">
          {editingId ? "Edit Product" : "Add New Product"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Products List</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              disabled={loading}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {loading && <p className="text-gray-500 mb-3">Loading...</p>}

        <div className="border rounded overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Product ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Product Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Category ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Category Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Price
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.product_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{product.product_id}</td>
                    <td className="px-4 py-2">{product.product_name}</td>
                    <td className="px-4 py-2">{product.category_id}</td>
                    <td className="px-4 py-2">
                      {product.category_name || "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      {product.price
                        ? `₹ ${parseFloat(product.price).toFixed(2)}`
                        : "-"}
                    </td>
                    <td className="px-4 py-2">{product.description || "-"}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(product)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 mr-3 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.product_id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="text-gray-600">
            Showing{" "}
            {products.length > 0
              ? (pagination.currentPage - 1) * pagination.pageSize + 1
              : 0}{" "}
            to{" "}
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.totalRecords,
            )}{" "}
            of {pagination.totalRecords} products
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={!pagination.hasPreviousPage || loading}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage || loading}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="px-3 py-1 text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages || 1}
            </span>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={!pagination.hasNextPage || loading}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductMaster;
