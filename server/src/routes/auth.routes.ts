/**
 * Authentication Routes
 * 
 * Handles user registration, login, and token verification
 * Uses JWT for authentication and bcrypt for password hashing
 * 
 * @fileoverview Express routes for user authentication
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.model.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user account
 * 
 * Validates email, password (min 6 chars), and name
 * Hashes password before storing in database
 * Returns JWT token and user data on success
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty()
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Check if user with this email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password with bcrypt (10 salt rounds for security)
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user document
      const user = new User({
        email,
        password: hashedPassword, // Store hashed password, never plain text
        name
      });

      await user.save();

      // Generate JWT token for authentication
      // Token expires in 7 days
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token valid for 7 days
      );

      return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: error.message || 'Failed to register user' });
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * 
 * Validates email format and password presence
 * Compares provided password with hashed password in database
 * Returns JWT token and user data on success
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(), // Validate and normalize email
    body('password').notEmpty() // Password must be provided
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists (security best practice)
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password using bcrypt compare
      // This securely compares plain password with hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({ error: error.message || 'Failed to login' });
    }
  }
);

/**
 * GET /api/auth/verify
 * Verify JWT token and return current user data
 * 
 * Used by frontend to check if user is still authenticated
 * Returns fresh user data from database
 */
router.get('/verify', async (req: express.Request, res: express.Response) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Remove 'Bearer ' prefix to get actual token
    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; email: string; name: string };
    
    // Fetch fresh user data from database (exclude password field)
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      }
    });
  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    } else {
      return res.status(500).json({ error: error.message || 'Failed to verify token' });
    }
  }
});

export default router;
