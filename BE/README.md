# E-commerce Server

A Node.js/Express backend server for the e-commerce platform with MongoDB database integration and Stripe payment processing.

## Features

- **Authentication & Authorization**: JWT-based user authentication with role-based access control
- **Product Management**: CRUD operations for products with image upload support
- **Order Management**: Complete order processing workflow
- **Payment Integration**: Stripe payment processing
- **Review System**: Product reviews and ratings
- **Admin Panel**: Administrative functions for platform management
- **Seller Dashboard**: Seller-specific functionality
- **Category Management**: Product categorization system

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: Helmet, CORS
- **Payment**: Stripe API
- **Environment**: dotenv

## Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Stripe account (for payment processing)

## Installation

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd ecommerce-store/server
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Setup**:

   ```bash
   cp env.example .env
   ```

   Edit the `.env` file with your configuration:

   ```env
   MONGODB_URI=mongodb://localhost:27017/ecommerce-store
   PORT=3001
   JWT_SECRET=your_jwt_secret_key_here
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

## Running the Server

### Development Mode

```bash
npm run dev
```

This will start the server with nodemon for automatic restarts on file changes.

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (authenticated)
- `PUT /api/products/:id` - Update product (authenticated)
- `DELETE /api/products/:id` - Delete product (authenticated)

### Orders

- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

### Reviews

- `GET /api/reviews/:productId` - Get product reviews
- `POST /api/reviews` - Create review (authenticated)
- `PUT /api/reviews/:id` - Update review (authenticated)
- `DELETE /api/reviews/:id` - Delete review (authenticated)

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Payments

- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/confirm-payment` - Confirm payment

### Admin

- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/orders` - Get all orders (admin)
- `PUT /api/admin/users/:id` - Update user (admin)

### Seller

- `GET /api/seller/products` - Get seller's products
- `GET /api/seller/orders` - Get seller's orders
- `GET /api/seller/dashboard` - Seller dashboard data

## Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── productController.js # Product management
│   ├── orderController.js   # Order processing
│   ├── reviewController.js  # Review management
│   ├── adminController.js   # Admin functions
│   ├── sellerController.js  # Seller functions
│   ├── categoryController.js # Category management
│   └── paymentController.js # Payment processing
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── upload.js           # File upload middleware
│   └── validation.js       # Input validation
├── models/
│   ├── User.js             # User model
│   ├── Product.js          # Product model
│   ├── Order.js            # Order model
│   ├── Review.js           # Review model
│   └── Category.js         # Category model
├── routes/
│   ├── authRoutes.js       # Authentication routes
│   ├── productRoutes.js    # Product routes
│   ├── orderRoutes.js      # Order routes
│   ├── reviewRoutes.js     # Review routes
│   ├── adminRoutes.js      # Admin routes
│   ├── sellerRoutes.js     # Seller routes
│   ├── categoryRoutes.js   # Category routes
│   └── paymentRoutes.js    # Payment routes
├── services/
│   └── stripeService.js    # Stripe integration
├── utils/
│   └── initData.js         # Database initialization
├── uploads/                # File upload directory
├── app.js                  # Express app configuration
├── index.js                # Server entry point
├── package.json            # Dependencies and scripts
├── .gitignore              # Git ignore rules
├── env.example             # Environment variables template
└── README.md               # This file
```

## Environment Variables

| Variable                 | Description               | Required | Default                                     |
| ------------------------ | ------------------------- | -------- | ------------------------------------------- |
| `MONGODB_URI`            | MongoDB connection string | Yes      | `mongodb://localhost:27017/ecommerce-store` |
| `PORT`                   | Server port               | No       | `3001`                                      |
| `NODE_ENV`               | Environment mode          | No       | `development`                               |
| `JWT_SECRET`             | JWT signing secret        | Yes      | -                                           |
| `STRIPE_SECRET_KEY`      | Stripe secret key         | Yes      | -                                           |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key    | Yes      | -                                           |
| `CORS_ORIGIN`            | CORS allowed origin       | No       | `*`                                         |
| `MAX_FILE_SIZE`          | Max file upload size      | No       | `5242880` (5MB)                             |
| `ALLOWED_FILE_TYPES`     | Allowed file types        | No       | `image/jpeg,image/png,image/gif,image/webp` |

## Database Schema

### User Model

- `name`, `email`, `password` (hashed)
- `role` (user, seller, admin)
- `avatar`, `phone`, `address`
- `createdAt`, `updatedAt`

### Product Model

- `name`, `description`, `price`, `category`
- `images`, `stock`, `seller` (User reference)
- `rating`, `reviewCount`
- `createdAt`, `updatedAt`

### Order Model

- `user` (User reference), `products` (array)
- `totalAmount`, `status`, `shippingAddress`
- `paymentIntentId`, `createdAt`, `updatedAt`

### Review Model

- `user` (User reference), `product` (Product reference)
- `rating`, `comment`
- `createdAt`, `updatedAt`

### Category Model

- `name`, `description`, `image`
- `createdAt`, `updatedAt`

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **JWT**: Secure authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Request validation middleware
- **File Upload Security**: Type and size restrictions

## Development

### Adding New Features

1. Create model in `models/` directory
2. Add controller logic in `controllers/` directory
3. Define routes in `routes/` directory
4. Add middleware if needed in `middleware/` directory
5. Update `app.js` to include new routes

### Database Seeding

The server automatically initializes default data on startup through `utils/initData.js`. This includes:

- Default admin user
- Sample categories
- Sample products

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:

   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env` file
   - Verify network connectivity

2. **JWT Errors**:

   - Ensure `JWT_SECRET` is set in `.env`
   - Check token expiration
   - Verify token format

3. **Stripe Errors**:

   - Verify Stripe keys in `.env`
   - Check Stripe account status
   - Ensure proper webhook configuration

4. **File Upload Issues**:
   - Check `uploads/` directory permissions
   - Verify file size limits
   - Ensure allowed file types

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
