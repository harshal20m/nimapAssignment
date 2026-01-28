-- Create Database
CREATE DATABASE IF NOT EXISTS product_management;
USE product_management;

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Insert Sample Categories
INSERT INTO categories (category_name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Clothing', 'Apparel and fashion items'),
('Books', 'Books and publications'),
('Home & Kitchen', 'Home appliances and kitchen items'),
('Sports', 'Sports equipment and accessories');

-- Insert Sample Products
INSERT INTO products (product_name, description, price, category_id) VALUES
('Laptop', 'High-performance laptop', 899.99, 1),
('Smartphone', 'Latest smartphone model', 699.99, 1),
('Wireless Headphones', 'Noise-cancelling headphones', 199.99, 1),
('T-Shirt', 'Cotton t-shirt', 19.99, 2),
('Jeans', 'Denim jeans', 49.99, 2),
('Novel Book', 'Bestselling fiction novel', 14.99, 3),
('Cookbook', 'Recipes for home cooking', 24.99, 3),
('Blender', 'High-speed blender', 79.99, 4),
('Coffee Maker', 'Automatic coffee maker', 89.99, 4),
('Yoga Mat', 'Non-slip yoga mat', 29.99, 5),
('Running Shoes', 'Comfortable running shoes', 79.99, 5),
('Basketball', 'Official size basketball', 24.99, 5),
('Tablet', '10-inch tablet', 399.99, 1),
('Smart Watch', 'Fitness tracking smartwatch', 249.99, 1),
('Jacket', 'Winter jacket', 89.99, 2),
('Dress', 'Summer dress', 59.99, 2),
('Textbook', 'Computer Science textbook', 89.99, 3),
('Microwave', 'Compact microwave oven', 129.99, 4),
('Toaster', '4-slice toaster', 39.99, 4),
('Dumbbells', 'Set of dumbbells', 49.99, 5);