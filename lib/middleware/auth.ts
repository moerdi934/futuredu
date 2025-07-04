// lib/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

// Types
export interface User {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

export type NextHandler = () => void | Promise<void>;

export type MiddlewareFunction = (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: NextHandler
) => void | Promise<void>;

const secretKey = process.env.JWT_SECRET_KEY!;

// JWT Authentication Middleware
export const authenticateJWT: MiddlewareFunction = (req, res, next) => {
  let token = req.cookies.authToken || req.headers['authorization'] as string;

  if (token) {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }

    jwt.verify(token, secretKey, (err: any, user: any) => {
      console.log('Verifying token...');
      if (err) {
        console.error('JWT Verification Error:', err);
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = user as User;
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Optional JWT Authentication Middleware
export const optionalAuthenticateJWT: MiddlewareFunction = (req, res, next) => {
  let token = req.cookies.authToken || req.headers['authorization'] as string;
  
  if (token) {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }
    
    jwt.verify(token, secretKey, (err: any, user: any) => {
      if (!err) {
        req.user = user as User;
      }
      next();
    });
  } else {
    next();
  }
};

// Role-based Authentication Middleware
export const authenticateRole = (roles: string[]): MiddlewareFunction => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  };
};

// Middleware Runner - untuk menjalankan multiple middleware
export const runMiddleware = (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  fn: MiddlewareFunction
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};