import { Request, Response } from 'express';
import { runQuery, getQuery, allQuery } from '../database/connection';
import { AddToCartRequest, Product, Cart } from '../types';

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { product_id, qty }: AddToCartRequest = req.body;
    const userId = req.user?.userId;

    // Validate input - check if fields are present
    if (product_id === null || product_id === undefined ||
        qty === null || qty === undefined) {
      return res.status(400).json({
        error: 'Product ID and quantity are required',
        message: 'Product ID and quantity are required'
      });
    }

    // Validate types - must be numbers
    if (typeof product_id !== 'number' || typeof qty !== 'number') {
      return res.status(400).json({
        error: 'Product ID and quantity must be numbers',
        message: 'Product ID and quantity must be numbers'
      });
    }

    // Validate product_id is a valid integer
    if (!Number.isInteger(product_id) || product_id <= 0) {
      return res.status(400).json({
        error: 'Product ID must be a positive integer',
        message: 'Product ID must be a positive integer'
      });
    }

    // Validate quantity is a positive integer
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({
        error: 'Quantity must be a positive integer',
        message: 'Quantity must be a positive integer'
      });
    }

    // Check if product exists
    const product = await getQuery<Product>(
      'SELECT * FROM products WHERE id = ?',
      [product_id]
    );

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product not found'
      });
    }

    // Check if item already in cart
    const existingCartItem = await getQuery<Cart>(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (existingCartItem) {
      // Update quantity
      await runQuery(
        'UPDATE cart SET qty = qty + ? WHERE id = ?',
        [qty, existingCartItem.id]
      );
    } else {
      // Add new item to cart
      await runQuery(
        'INSERT INTO cart (user_id, product_id, qty) VALUES (?, ?, ?)',
        [userId, product_id, qty]
      );
    }

    res.status(201).json({
      message: 'Product added to cart successfully',
      data: {
        product_id,
        qty,
        user_id: userId
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const cartItems = await allQuery<any>(
      `SELECT c.id, c.qty, p.id as product_id, p.name, p.image, p.price,
              (c.qty * p.price) as subtotal
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      message: 'Cart retrieved successfully',
      data: {
        items: cartItems,
        total
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCartItem = async (req: Request, res: Response) => {
  try {
    const cartId = req.params.id;

    // No ownership check - anyone can delete any cart item!
    await runQuery('DELETE FROM cart WHERE id = ?', [cartId]);

    res.status(200).json({
      message: 'Cart item deleted successfully'
    });
  } catch (error) {
    console.error('Delete cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const cartId = req.params.id;
    const { qty } = req.body;

    if (qty === null || qty === undefined || typeof qty !== 'number') {
      return res.status(400).json({
        error: 'Quantity is required',
        message: 'Quantity is required'
      });
    }

    // No ownership check - anyone can update any cart item!
    await runQuery('UPDATE cart SET qty = ? WHERE id = ?', [qty, cartId]);

    res.status(200).json({
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
