# E-commerce API

A RESTful API built with Node.js, TypeScript, Express, and SQLite for an e-commerce application.

## Features

- User authentication with JWT
- Product management
- Shopping cart functionality
- Transaction/checkout system
- SQLite database

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Initialize the database:
```bash
npm run init-db
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The server will run on `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

## API Endpoints

### 1. Sign Up
**POST** `/api/signup`

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "birthdate": "1990-01-01",
  "address": "123 Main St, City",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "birthdate": "1990-01-01",
    "address": "123 Main St, City"
  }
}
```

### 2. Login
**POST** `/api/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. Get Products
**GET** `/api/products`

Retrieve all products.

**Response:**
```json
{
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "image": "https://via.placeholder.com/150/laptop",
      "price": 999.99,
      "created_at": "2024-01-01 00:00:00"
    }
  ]
}
```

### 4. Add to Cart
**POST** `/api/cart`

Add a product to the cart. Requires authentication.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "product_id": 1,
  "qty": 2
}
```

**Response:**
```json
{
  "message": "Product added to cart successfully",
  "data": {
    "product_id": 1,
    "qty": 2,
    "user_id": 1
  }
}
```

### 5. Get Cart
**GET** `/api/cart`

Get current user's cart. Requires authentication.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "message": "Cart retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "qty": 2,
        "product_id": 1,
        "name": "Laptop",
        "image": "https://via.placeholder.com/150/laptop",
        "price": 999.99,
        "subtotal": 1999.98
      }
    ],
    "total": 1999.98
  }
}
```

### 6. Checkout / Transaction
**POST** `/api/checkout`

Create a transaction for a cart item. Requires authentication.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "cart_id": 1,
  "admin_fee": 5.00
}
```

**Response:**
```json
{
  "message": "Transaction created successfully",
  "data": {
    "transaction_id": 1,
    "cart_id": 1,
    "subtotal": 1999.98,
    "admin_fee": 5.00,
    "total": 2004.98,
    "created_at": "2024-01-01 12:00:00"
  }
}
```

### 7. Get Transactions
**GET** `/api/transactions`

Get user's transaction history. Requires authentication.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "cart_id": 1,
      "admin_fee": 5.00,
      "subtotal": 1999.98,
      "total": 2004.98,
      "product_id": 1,
      "qty": 2,
      "product_name": "Laptop",
      "price": 999.99,
      "created_at": "2024-01-01 12:00:00"
    }
  ]
}
```

## Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

The token is obtained from the login endpoint and is valid for 24 hours by default.

## Database Schema

### Users
- id (PRIMARY KEY)
- name
- birthdate
- address
- email (UNIQUE)
- password (hashed)
- created_at

### Products
- id (PRIMARY KEY)
- name
- image
- price
- created_at

### Cart
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- product_id (FOREIGN KEY)
- qty
- created_at

### Transactions
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- cart_id (FOREIGN KEY)
- admin_fee
- subtotal
- total
- created_at

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Testing with cURL

### Sign Up:
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "birthdate": "1990-01-01",
    "address": "123 Main St",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Products:
```bash
curl http://localhost:3000/api/products
```

### Add to Cart:
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "product_id": 1,
    "qty": 2
  }'
```

### Checkout:
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "cart_id": 1,
    "admin_fee": 5.00
  }'
```

## Project Structure

```
simulasi/
├── src/
│   ├── controllers/       # Request handlers
│   ├── database/          # Database connection and initialization
│   ├── middleware/        # JWT authentication middleware
│   ├── routes/            # API routes
│   ├── types/             # TypeScript type definitions
│   └── index.ts           # Main application file
├── .env                   # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

All HTTPS Status code and message will be on error_code.md
## License

ISC
