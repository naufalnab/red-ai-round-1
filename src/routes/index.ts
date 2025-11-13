import { Router } from 'express';
import { signUp, login } from '../controllers/authController';
import { getProducts } from '../controllers/productController';
import { addToCart, getCart, deleteCartItem, updateCartItem } from '../controllers/cartController';
import { checkout, getTransactions, getTransactionById } from '../controllers/transactionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Auth routes (public)
router.post('/signup', signUp);
router.post('/login', login);

// Product routes (public)
router.get('/products', getProducts);

// Cart routes (protected)
router.post('/cart', authenticateToken, addToCart);
router.get('/cart', authenticateToken, getCart);
router.delete('/cart/:id', authenticateToken, deleteCartItem);
router.put('/cart/:id', authenticateToken, updateCartItem);

// Transaction routes (protected)
router.post('/checkout', authenticateToken, checkout);
router.get('/transactions', authenticateToken, getTransactions);
router.get('/transactions/:id', authenticateToken, getTransactionById);

export default router;
