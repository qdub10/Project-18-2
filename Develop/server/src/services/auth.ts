import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET_KEY || '';

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden' }); // Forbidden
      }

      req.user = user as JwtPayload;
      return next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' }); // Unauthorized
  }
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

// Middleware for GraphQL context
export const contextMiddleware = ({ req }: { req: Request }) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET_KEY || '';

    try {
      const user = jwt.verify(token, secretKey) as JwtPayload;
      return { user };
    } catch (err) {
      return { user: null };
    }
  }
  return { user: null };
};
