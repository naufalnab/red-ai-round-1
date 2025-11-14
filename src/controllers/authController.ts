import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getQuery, runQuery } from '../database/connection';
import { User, SignUpRequest, LoginRequest } from '../types';

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && !email.includes(' ');
};

// Helper function to validate date format (YYYY-MM-DD)
const isValidDate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  const timestamp = date.getTime();

  if (isNaN(timestamp)) return false;

  // Check if the date components match (to catch invalid dates like 2025-99-99)
  const [year, month, day] = dateString.split('-').map(Number);
  return date.getFullYear() === year &&
         date.getMonth() + 1 === month &&
         date.getDate() === day;
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const { name, birthdate, address, email, password }: SignUpRequest = req.body;

    // Validate that all fields are present and not null/undefined
    if (name === null || name === undefined || name === '' ||
        birthdate === null || birthdate === undefined || birthdate === '' ||
        address === null || address === undefined || address === '' ||
        email === null || email === undefined || email === '' ||
        password === null || password === undefined || password === '') {
      return res.status(400).json({
        error: 'All fields are required',
        message: 'All fields are required'
      });
    }

    // Type checking
    if (typeof name !== 'string' || typeof birthdate !== 'string' ||
        typeof address !== 'string' || typeof email !== 'string' ||
        typeof password !== 'string') {
      return res.status(400).json({
        error: 'Invalid field types',
        message: 'Invalid field types'
      });
    }

    // Trim strings
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedAddress = address.trim();
    const trimmedPassword = password.trim();

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Invalid email format'
      });
    }

    // Validate date format
    if (!isValidDate(birthdate)) {
      return res.status(400).json({
        error: 'Invalid birthdate format. Use YYYY-MM-DD',
        message: 'Invalid birthdate format. Use YYYY-MM-DD'
      });
    }

    // Check if user already exists
    const existingUser = await getQuery<User>(
      'SELECT * FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    // Insert new user
    await runQuery(
      'INSERT INTO users (name, birthdate, address, email, password) VALUES (?, ?, ?, ?, ?)',
      [trimmedName, birthdate, trimmedAddress, trimmedEmail, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      data: { name: trimmedName, email: trimmedEmail, birthdate, address: trimmedAddress }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password || email === null || password === null ||
        typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        error: 'Email and password are required',
        message: 'Email and password are required'
      });
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Find user
    const user = await getQuery<User>(
      'SELECT * FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Incorrect password',
        message: 'Incorrect password'
      });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
