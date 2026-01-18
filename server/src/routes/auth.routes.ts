import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.model.js';

const router = express.Router();

// Register new user
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

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        name
      });

      await user.save();

      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
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
      res.status(500).json({ error: error.message || 'Failed to register user' });
    }
  }
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
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

      res.json({
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
      res.status(500).json({ error: error.message || 'Failed to login' });
    }
  }
);

// Verify token (for checking if user is authenticated)
router.get('/verify', async (req: express.Request, res: express.Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; email: string; name: string };
    
    // Get fresh user data
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      }
    });
  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: error.message || 'Failed to verify token' });
    }
  }
});

export default router;
