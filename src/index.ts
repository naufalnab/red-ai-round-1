import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'E-commerce API is running',
    version: '1.0.0',
    endpoints: {
      signup: 'POST /api/signup',
      login: 'POST /api/login',
      products: 'GET /api/products',
      addToCart: 'POST /api/cart (requires auth)',
      getCart: 'GET /api/cart (requires auth)',
      checkout: 'POST /api/checkout (requires auth)',
      transactions: 'GET /api/transactions (requires auth)'
    }
  });
});

// API routes
app.use('/api', routes);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}`);
});

export default app;
