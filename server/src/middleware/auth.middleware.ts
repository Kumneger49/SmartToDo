/**
 * Authentication Middleware
 * 
 * Protects routes by verifying JWT tokens
 * Extracts user information from token and attaches to request
 * 
 * @fileoverview Express middleware for JWT authentication
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Extended Express Request interface
 * Adds user information to request object after authentication
 */
export interface AuthRequest extends Request {
  userId?: string; // User ID from JWT token
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Authentication middleware
 * 
 * Verifies JWT token from Authorization header
 * Attaches user information to request if token is valid
 * Returns 401 if token is missing, invalid, or expired
 * 
 * @param req - Express request (with AuthRequest type)
 * @param res - Express response
 * @param next - Express next function to continue to route handler
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Extract JWT token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Remove 'Bearer ' prefix to get actual token
    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Verify and decode JWT token
    // Throws error if token is invalid, expired, or tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; email: string; name: string };
    
    // Attach user information to request object
    // This makes user data available to route handlers
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };
    
    // Continue to next middleware or route handler
    next();
  } catch (error) {
    // Handle different JWT error types
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
};
