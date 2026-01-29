require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createClient } = require("@libsql/client");

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ==================== //since we are using react for frontend we must need to enable body parsing
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== TURSO DB ==================== //using this for online mysql hosting its free tier
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Test DB connection
(async () => {
  try {
    await db.execute("SELECT 1");
    console.log("Turso database connected");
  } catch (err) {
    console.error("failed !!!!!!!!!! Database connection failed:", err);
  }
})();

// ==================== CATEGORY ROUTES ====================

// GET all categories
app.get("/api/categories", async (req, res) => {
  try {
    const result = await db.execute(
      "SELECT * FROM categories ORDER BY category_id DESC",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single category
app.get("/api/categories/:id", async (req, res) => {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM categories WHERE category_id = ?",
      args: [req.params.id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE category
app.post("/api/categories", async (req, res) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const result = await db.execute({
      sql: "INSERT INTO categories (category_name, description) VALUES (?, ?)",
      args: [category_name, description || null],
    });

    res.status(201).json({
      message: "Category created successfully",
      category_id: result.lastInsertRowid,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE category
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const result = await db.execute({
      sql: "UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?",
      args: [category_name, description || null, req.params.id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE category
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const productCheck = await db.execute({
      sql: "SELECT COUNT(*) AS count FROM products WHERE category_id = ?",
      args: [req.params.id],
    });

    if (productCheck.rows[0].count > 0) {
      return res.status(400).json({
        error: "Cannot delete category. It has associated products.",
      });
    }

    const result = await db.execute({
      sql: "DELETE FROM categories WHERE category_id = ?",
      args: [req.params.id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PRODUCT ROUTES ====================

// GET products with pagination
app.get("/api/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const countResult = await db.execute(
      "SELECT COUNT(*) AS total FROM products",
    );

    const totalRecords = countResult.rows[0].total;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const result = await db.execute({
      sql: `
        SELECT 
          p.product_id,
          p.product_name,
          p.description,
          p.price,
          p.category_id,
          c.category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        ORDER BY p.product_id DESC
        LIMIT ? OFFSET ?
      `,
      args: [pageSize, offset],
    });

    res.json({
      products: result.rows,
      pagination: {
        currentPage: page,
        pageSize,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          p.product_id,
          p.product_name,
          p.description,
          p.price,
          p.category_id,
          c.category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE p.product_id = ?
      `,
      args: [req.params.id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE product
app.post("/api/products", async (req, res) => {
  try {
    const { product_name, description, price, category_id } = req.body;

    if (!product_name || !category_id) {
      return res
        .status(400)
        .json({ error: "Product name and category are required" });
    }

    const categoryCheck = await db.execute({
      sql: "SELECT category_id FROM categories WHERE category_id = ?",
      args: [category_id],
    });

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const result = await db.execute({
      sql: `
        INSERT INTO products (product_name, description, price, category_id)
        VALUES (?, ?, ?, ?)
      `,
      args: [product_name, description || null, price || null, category_id],
    });

    res.status(201).json({
      message: "Product created successfully",
      product_id: result.lastInsertRowid,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { product_name, description, price, category_id } = req.body;

    if (!product_name || !category_id) {
      return res
        .status(400)
        .json({ error: "Product name and category are required" });
    }

    const result = await db.execute({
      sql: `
        UPDATE products
        SET product_name = ?, description = ?, price = ?, category_id = ?
        WHERE product_id = ?
      `,
      args: [
        product_name,
        description || null,
        price || null,
        category_id,
        req.params.id,
      ],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const result = await db.execute({
      sql: "DELETE FROM products WHERE product_id = ?",
      args: [req.params.id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`Server running -> http://localhost:${PORT}`);
});
