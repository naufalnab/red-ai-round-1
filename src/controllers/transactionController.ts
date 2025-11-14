import { Request, Response } from 'express';
import { runQuery, getQuery, allQuery } from '../database/connection';
import { CheckoutRequest } from '../types';

export const checkout = async (req: Request, res: Response) => {
  try {
    const { cart_id, admin_fee }: CheckoutRequest = req.body;
    const userId = req.user?.userId;

    // Validate input - check if fields are present
    if (cart_id === null || cart_id === undefined ||
        admin_fee === null || admin_fee === undefined) {
      return res.status(400).json({
        error: 'Cart ID and admin fee are required',
        message: 'Cart ID and admin fee are required'
      });
    }

    // Validate types
    if (typeof cart_id !== 'number' || typeof admin_fee !== 'number') {
      return res.status(400).json({
        error: 'Cart ID and admin fee must be numbers',
        message: 'Cart ID and admin fee must be numbers'
      });
    }

    // Validate cart_id is a valid positive integer
    if (!Number.isInteger(cart_id) || cart_id <= 0) {
      return res.status(400).json({
        error: 'Cart ID must be a positive integer',
        message: 'Cart ID must be a positive integer'
      });
    }

    // Validate admin_fee is non-negative
    if (admin_fee < 0) {
      return res.status(400).json({
        error: 'Admin fee cannot be negative',
        message: 'Admin fee cannot be negative'
      });
    }

    // Verify cart belongs to user
    const cartItem = await getQuery<any>(
      'SELECT * FROM cart WHERE id = ? AND user_id = ?',
      [cart_id, userId]
    );

    if (!cartItem) {
      return res.status(404).json({
        error: 'Cart item not found',
        message: 'Cart item not found'
      });
    }

    // Check if cart has already been checked out
    const existingTransaction = await getQuery<any>(
      'SELECT * FROM transactions WHERE cart_id = ?',
      [cart_id]
    );

    if (existingTransaction) {
      return res.status(409).json({
        error: 'Cart has already been checked out',
        message: 'Cart has already been checked out'
      });
    }

    // Calculate subtotal for this cart item
    const cartDetails = await getQuery<any>(
      `SELECT c.*, p.price, (c.qty * p.price) as subtotal
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.id = ?`,
      [cart_id]
    );

    if (!cartDetails) {
      return res.status(404).json({
        error: 'Cart details not found',
        message: 'Cart details not found'
      });
    }

    const subtotal = cartDetails.subtotal;
    
    // Validate quantity is positive
    if (cartDetails.qty <= 0) {
      return res.status(400).json({
        error: 'Cart quantity must be positive',
        message: 'Cart quantity must be positive'
      });
    }
    
    const total = subtotal + admin_fee;

    // Create transaction and delete cart item
    await runQuery(
      'INSERT INTO transactions (user_id, cart_id, admin_fee, subtotal, total) VALUES (?, ?, ?, ?, ?)',
      [userId, cart_id, admin_fee, subtotal, total]
    );
    
    // Delete cart item after checkout
    await runQuery('DELETE FROM cart WHERE id = ?', [cart_id]);

    // Get the transaction ID
    const transaction = await getQuery<any>(
      'SELECT * FROM transactions WHERE user_id = ? AND cart_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId, cart_id]
    );

    res.status(201).json({
      message: 'Transaction created successfully',
      data: {
        transaction_id: transaction.id,
        cart_id,
        subtotal,
        admin_fee,
        total,
        created_at: transaction.created_at
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const search = req.query.search as string;

    let query = `SELECT t.*, c.product_id, c.qty, p.name as product_name, p.price,
                 u.email as user_email, u.address as user_address
                 FROM transactions t
                 JOIN cart c ON t.cart_id = c.id
                 JOIN products p ON c.product_id = p.id
                 JOIN users u ON t.user_id = u.id
                 WHERE t.user_id = ${userId}`;

    if (search) {
      query += ` AND (p.name LIKE '%${search}%' OR t.id = '${search}')`;
    }

    query += ' ORDER BY t.created_at DESC';

    const transactions = await allQuery<any>(query, []);

    res.status(200).json({
      message: 'Transactions retrieved successfully',
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.id;

    // No ownership check - anyone can view any transaction!
    const transaction = await getQuery<any>(
      `SELECT t.*, c.product_id, c.qty, p.name as product_name, p.price,
              u.email as user_email, u.name as user_name, u.address as user_address
       FROM transactions t
       JOIN cart c ON t.cart_id = c.id
       JOIN products p ON c.product_id = p.id
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [transactionId]
    );

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      message: 'Transaction retrieved successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
