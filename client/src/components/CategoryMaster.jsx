import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CategoryMaster.css";

const API_URL = "https://nimapassignment.onrender.com/api";

function CategoryMaster() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category_name: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch categories: " + err.message);
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

    if (!formData.category_name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`${API_URL}/categories/${editingId}`, formData);
        setSuccess("Category updated successfully");
      } else {
        await axios.post(`${API_URL}/categories`, formData);
        setSuccess("Category created successfully");
      }

      setFormData({ category_name: "", description: "" });
      setEditingId(null);
      setError("");
      fetchCategories();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Operation failed: " + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      category_name: category.category_name,
      description: category.description || "",
    });
    setEditingId(category.category_id);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/categories/${id}`);
      setSuccess("Category deleted successfully");
      fetchCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Delete failed: " + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ category_name: "", description: "" });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  return (
    <div className="category-master">
      <h2>Category Master</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-container">
        <h3>{editingId ? "Edit Category" : "Add New Category"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category_name">Category Name *</label>
            <input
              type="text"
              id="category_name"
              name="category_name"
              value={formData.category_name}
              onChange={handleInputChange}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter category description"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {editingId ? "Update" : "Create"} Category
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
        <h3>Categories List</h3>
        {loading && <div className="loading">Loading...</div>}

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.category_id}>
                  <td>{category.category_id}</td>
                  <td>{category.category_name}</td>
                  <td>{category.description || "-"}</td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(category)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(category.category_id)}
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
      </div>
    </div>
  );
}

export default CategoryMaster;
