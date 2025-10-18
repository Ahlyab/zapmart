import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key_here');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database simulation using JSON files
const DB_PATH = path.join(__dirname, 'database');

// Ensure database directory exists
const initDB = async () => {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(DB_PATH, { recursive: true });
  }
  
  // Initialize database files
  const files = ['users.json', 'products.json', 'orders.json', 'categories.json', 'reviews.json'];
  for (const file of files) {
    try {
      await fs.access(path.join(DB_PATH, file));
    } catch {
      await fs.writeFile(path.join(DB_PATH, file), JSON.stringify([]));
    }
  }
  
  // Initialize categories if empty
  const categoriesPath = path.join(DB_PATH, 'categories.json');
  const categories = JSON.parse(await fs.readFile(categoriesPath, 'utf8'));
  if (categories.length === 0) {
    const defaultCategories = [
      { id: '1', name: 'Electronics', description: 'Electronic devices and gadgets' },
      { id: '2', name: 'Clothing', description: 'Fashion and apparel' },
      { id: '3', name: 'Home & Garden', description: 'Home improvement and garden supplies' },
      { id: '4', name: 'Books', description: 'Books and educational materials' },
      { id: '5', name: 'Sports', description: 'Sports equipment and accessories' }
    ];
    await fs.writeFile(categoriesPath, JSON.stringify(defaultCategories, null, 2));
  }
  
  // Create admin user if doesn't exist
  const usersPath = path.join(DB_PATH, 'users.json');
  const users = JSON.parse(await fs.readFile(usersPath, 'utf8'));
  const adminExists = users.find(user => user.role === 'admin');
  
  if (!adminExists) {
    const adminUser = {
      id: Date.now().toString(),
      email: 'admin@ecommerce.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'admin',
      isApproved: true,
      createdAt: new Date().toISOString()
    };
    users.push(adminUser);
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
    console.log('Admin user created: admin@ecommerce.com / admin123');
  }
};

// Database helper functions
const readDB = async (collection) => {
  const data = await fs.readFile(path.join(DB_PATH, `${collection}.json`), 'utf8');
  return JSON.parse(data);
};

const writeDB = async (collection, data) => {
  await fs.writeFile(path.join(DB_PATH, `${collection}.json`), JSON.stringify(data, null, 2));
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role = 'customer' } = req.body;
    
    const users = await readDB('users');
    const existingUser = users.find(user => user.email === email);
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      role,
      isApproved: role === 'customer' || role === 'admin',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeDB('users', users);
    
    const { password: _, ...userWithoutPassword } = newUser;
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const users = await readDB('users');
    const user = users.find(u => u.email === email);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User profile update route
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, address, city, country, phone } = req.body;
    
    const users = await readDB('users');
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      address: address || users[userIndex].address,
      city: city || users[userIndex].city,
      country: country || users[userIndex].country,
      phone: phone || users[userIndex].phone,
      updatedAt: new Date().toISOString()
    };
    
    await writeDB('users', users);
    
    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json({ user: userWithoutPassword, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile route
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const users = await readDB('users');
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Categories routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await readDB('categories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Products routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await readDB('products');
    const reviews = await readDB('reviews');
    const { category, search } = req.query;
    
    let filteredProducts = products.filter(product => product.isActive);
    
    if (category) {
      filteredProducts = filteredProducts.filter(product => product.categoryId === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Add review stats to each product
    const productsWithReviews = filteredProducts.map(product => {
      const productReviews = reviews.filter(review => review.productId === product.id);
      const totalReviews = productReviews.length;
      const averageRating = totalReviews > 0 
        ? productReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;
      
      return {
        ...product,
        reviewStats: {
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution: {
            5: productReviews.filter(r => r.rating === 5).length,
            4: productReviews.filter(r => r.rating === 4).length,
            3: productReviews.filter(r => r.rating === 3).length,
            2: productReviews.filter(r => r.rating === 2).length,
            1: productReviews.filter(r => r.rating === 1).length
          }
        }
      };
    });
    
    res.json(productsWithReviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const products = await readDB('products');
    const reviews = await readDB('reviews');
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get reviews for this product
    const productReviews = reviews.filter(review => review.productId === req.params.id);
    
    // Calculate average rating and total reviews
    const totalReviews = productReviews.length;
    const averageRating = totalReviews > 0 
      ? productReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    const productWithStats = {
      ...product,
      reviewStats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution: {
          5: productReviews.filter(r => r.rating === 5).length,
          4: productReviews.filter(r => r.rating === 4).length,
          3: productReviews.filter(r => r.rating === 3).length,
          2: productReviews.filter(r => r.rating === 2).length,
          1: productReviews.filter(r => r.rating === 1).length
        }
      }
    };
    
    res.json(productWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/products', authenticateToken, requireRole(['seller']), async (req, res) => {
  try {
    const { name, description, price, categoryId, weight, dimensions, imageUrl } = req.body;
    
    const products = await readDB('products');
    const newProduct = {
      id: Date.now().toString(),
      name,
      description,
      price: parseFloat(price),
      categoryId,
      weight: parseFloat(weight),
      dimensions,
      imageUrl: imageUrl || 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
      sellerId: req.user.id,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    await writeDB('products', products);
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/products/:id', authenticateToken, requireRole(['seller']), async (req, res) => {
  try {
    const products = await readDB('products');
    const productIndex = products.findIndex(p => p.id === req.params.id && p.sellerId === req.user.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    products[productIndex] = { ...products[productIndex], ...req.body, updatedAt: new Date().toISOString() };
    await writeDB('products', products);
    
    res.json(products[productIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const products = await readDB('products');
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is seller of product or admin
    if (req.user.role !== 'admin' && products[productIndex].sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    products.splice(productIndex, 1);
    await writeDB('products', products);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Seller routes
app.get('/api/seller/products', authenticateToken, requireRole(['seller']), async (req, res) => {
  try {
    const products = await readDB('products');
    const sellerProducts = products.filter(product => product.sellerId === req.user.id);
    res.json(sellerProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/seller/orders', authenticateToken, requireRole(['seller']), async (req, res) => {
  try {
    const orders = await readDB('orders');
    const products = await readDB('products');
    
    const sellerOrders = orders.filter(order => 
      order.items.some(item => {
        const product = products.find(p => p.id === item.productId);
        return product && product.sellerId === req.user.id;
      })
    );
    
    res.json(sellerOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
app.get('/api/admin/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await readDB('users');
    const products = await readDB('products');
    const orders = await readDB('orders');
    
    const stats = {
      totalCustomers: users.filter(u => u.role === 'customer').length,
      totalSellers: users.filter(u => u.role === 'seller').length,
      pendingSellers: users.filter(u => u.role === 'seller' && !u.isApproved).length,
      bannedUsers: users.filter(u => u.isBanned).length,
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await readDB('users');
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/users/:id/approve', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await readDB('users');
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    users[userIndex].isApproved = true;
    await writeDB('users', users);
    
    const { password, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Ban/Unban user
app.put('/api/admin/users/:id/ban', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await readDB('users');
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from banning themselves
    if (users[userIndex].role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban admin users' });
    }
    
    const { isBanned } = req.body;
    users[userIndex].isBanned = isBanned;
    await writeDB('users', users);
    
    const { password, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
app.delete('/api/admin/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await readDB('users');
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (users[userIndex].role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }
    
    // Remove user from users array
    users.splice(userIndex, 1);
    await writeDB('users', users);
    
    // Also remove associated products if user is a seller
    if (users[userIndex].role === 'seller') {
      const products = await readDB('products');
      const updatedProducts = products.filter(p => p.sellerId !== req.params.id);
      await writeDB('products', updatedProducts);
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/products', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const products = await readDB('products');
    const users = await readDB('users');
    
    // Enrich products with seller information
    const productsWithSellers = products.map(product => {
      const seller = users.find(user => user.id === product.sellerId);
      return {
        ...product,
        sellerName: seller ? seller.name : 'Unknown Seller',
        sellerEmail: seller ? seller.email : 'N/A'
      };
    });
    
    res.json(productsWithSellers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/orders', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const orders = await readDB('orders');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transactions with detailed information
app.get('/api/admin/transactions', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const orders = await readDB('orders');
    const users = await readDB('users');
    
    // Enhance orders with user information and transaction details
    const transactions = orders.map(order => {
      const user = users.find(u => u.id === order.userId);
      return {
        ...order,
        customerName: user ? user.name : 'Unknown User',
        customerEmail: user ? user.email : 'Unknown Email',
        customerRole: user ? user.role : 'Unknown Role'
      };
    });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed order information
app.get('/api/admin/orders/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const orders = await readDB('orders');
    const users = await readDB('users');
    const products = await readDB('products');
    
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const user = users.find(u => u.id === order.userId);
    const orderDetails = {
      ...order,
      customer: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null,
      items: order.items.map(item => {
        const product = products.find(p => p.id === item.id);
        return {
          ...item,
          productDetails: product ? {
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            sellerId: product.sellerId,
            isActive: product.isActive
          } : null
        };
      })
    };
    
    res.json(orderDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Category management routes
app.get('/api/admin/categories', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const categories = await readDB('categories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/categories', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    
    const categories = await readDB('categories');
    
    // Check if category name already exists
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    const newCategory = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString()
    };
    
    categories.push(newCategory);
    await writeDB('categories', categories);
    
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/categories/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;
    const categoryId = req.params.id;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    
    const categories = await readDB('categories');
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if new name conflicts with existing categories (excluding current one)
    const existingCategory = categories.find(cat => 
      cat.id !== categoryId && cat.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    categories[categoryIndex] = {
      ...categories[categoryIndex],
      name: name.trim(),
      description: description.trim(),
      updatedAt: new Date().toISOString()
    };
    
    await writeDB('categories', categories);
    res.json(categories[categoryIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/categories/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const categories = await readDB('categories');
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category is being used by any products
    const products = await readDB('products');
    const productsUsingCategory = products.filter(product => product.category === categories[categoryIndex].name);
    
    if (productsUsingCategory.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It is being used by ${productsUsingCategory.length} product(s).` 
      });
    }
    
    categories.splice(categoryIndex, 1);
    await writeDB('categories', categories);
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Stripe payment routes
app.post('/api/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'gbp' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user.id,
        userEmail: req.user.email
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Reviews routes
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const reviews = await readDB('reviews');
    const productReviews = reviews.filter(review => review.productId === req.params.id);
    res.json(productReviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/products/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const productId = req.params.id;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Check if user has purchased this product
    const orders = await readDB('orders');
    const hasPurchased = orders.some(order => 
      order.userId === req.user.id && 
      order.status === 'paid' &&
      order.items.some(item => item.id === productId)
    );
    
    if (!hasPurchased) {
      return res.status(403).json({ message: 'You can only review products you have purchased' });
    }
    
    // Check if user has already reviewed this product
    const reviews = await readDB('reviews');
    const existingReview = reviews.find(r => r.productId === productId && r.userId === req.user.id);
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    // Get user info
    const users = await readDB('users');
    const user = users.find(u => u.id === req.user.id);
    
    const newReview = {
      id: Date.now().toString(),
      productId,
      userId: req.user.id,
      userName: user.name,
      rating: parseInt(rating),
      review,
      createdAt: new Date().toISOString(),
      isVerified: true
    };
    
    reviews.push(newReview);
    await writeDB('reviews', reviews);
    
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const reviewId = req.params.id;
    
    const reviews = await readDB('reviews');
    const reviewIndex = reviews.findIndex(r => r.id === reviewId && r.userId === req.user.id);
    
    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    reviews[reviewIndex] = { 
      ...reviews[reviewIndex], 
      ...(rating && { rating: parseInt(rating) }), 
      ...(review && { review }),
      updatedAt: new Date().toISOString()
    };
    
    await writeDB('reviews', reviews);
    res.json(reviews[reviewIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const reviews = await readDB('reviews');
    const reviewIndex = reviews.findIndex(r => r.id === reviewId && r.userId === req.user.id);
    
    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    reviews.splice(reviewIndex, 1);
    await writeDB('reviews', reviews);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Orders routes
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, total, paymentIntentId } = req.body;
    
    const orders = await readDB('orders');
    const newOrder = {
      id: Date.now().toString(),
      userId: req.user.id,
      items,
      shippingAddress,
      total: parseFloat(total),
      status: paymentIntentId ? 'paid' : 'pending',
      paymentIntentId: paymentIntentId || null,
      createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    await writeDB('orders', orders);
    
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await readDB('orders');
    let userOrders;
    
    if (req.user.role === 'admin') {
      userOrders = orders;
    } else {
      userOrders = orders.filter(order => order.userId === req.user.id);
    }
    
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const reviews = await readDB('reviews');
    let userReviews;
    
    if (req.user.role === 'admin') {
      userReviews = reviews;
    } else {
      userReviews = reviews.filter(review => review.userId === req.user.id);
    }
    
    res.json(userReviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(console.error);