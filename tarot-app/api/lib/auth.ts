// JWT 认证工具

import jwt from 'jsonwebtoken';
import { User } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface TokenPayload {
  userId: string;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function authMiddleware(req: any, res: any, silent = false): Promise<string | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (!silent) {
        const { t } = await import('./i18n');
        res.status(401).json({ message: t(req, 'authRequired') });
      }
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      if (!silent) {
        const { t } = await import('./i18n');
        res.status(401).json({ message: t(req, 'invalidToken') });
      }
      return null;
    }
    return decoded.userId;
  } catch (error) {
    if (!silent) {
      const { t } = await import('./i18n');
      res.status(401).json({ message: t(req, 'invalidToken') });
    }
    return null;
  }
}
