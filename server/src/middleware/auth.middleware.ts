import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; email: string; name: string };
    
    // Attach user info to request
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
};
