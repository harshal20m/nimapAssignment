import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProductMaster.css";

const API_URL = "http://localhost:5000/api";

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

  // Pagination state
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
      console.error("Failed to fetch categories:", err);
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
      setError("Failed to fetch products: " + err.message);
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
      setError("Operation failed: " + err.response?.data?.error || err.message);
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
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/products/${id}`);
      setSuccess("Product deleted successfully");

      // If we deleted the last item on the current page and we're not on page 1, go back one page
      if (products.length === 1 && pagination.currentPage > 1) {
        fetchProducts(pagination.currentPage - 1, pagination.pageSize);
      } else {
        fetchProducts(pagination.currentPage, pagination.pageSize);
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Delete failed: " + err.response?.data?.error || err.message);
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
    fetchProducts(1, newPageSize); // Reset to page 1 when changing page size
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.category_id === categoryId);
    return category ? category.category_name : "N/A";
  };

  return (
    <div className="product-master">
      <h2>Product Master</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-container">
        <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product_name">Product Name *</label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category_id">Category *</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
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

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {editingId ? "Update" : "Create"} Product
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Products List</h3>
          <div className="page-size-selector">
            <label>Show: </label>
            <select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              disabled={loading}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span> per page</span>
          </div>
        </div>

        {loading && <div className="loading">Loading...</div>}

        <table className="data-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Category ID</th>
              <th>Category Name</th>
              <th>Price</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.product_id}>
                  <td>{product.product_id}</td>
                  <td>{product.product_name}</td>
                  <td>{product.category_id}</td>
                  <td>{product.category_name || "N/A"}</td>
                  <td>
                    {product.price
                      ? `₹${parseFloat(product.price).toFixed(2)}`
                      : "-"}
                  </td>
                  <td>{product.description || "-"}</td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(product)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(product.product_id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination">
          <div className="pagination-info">
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

          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(1)}
              disabled={!pagination.hasPreviousPage || loading}
              className="btn-pagination"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage || loading}
              className="btn-pagination"
            >
              Previous
            </button>

            <span className="page-numbers">
              Page {pagination.currentPage} of {pagination.totalPages || 1}
            </span>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="btn-pagination"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={!pagination.hasNextPage || loading}
              className="btn-pagination"
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
