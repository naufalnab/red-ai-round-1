import { Request, Response } from 'express';
import { allQuery } from '../database/connection';
import { Product } from '../types';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await allQuery<Product>('SELECT * FROM products');

    res.status(200).json({
      message: 'Products retrieved successfully',
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
