import type { Request, Response, NextFunction } from 'express';
import { verifyDemoToken } from '../lib/demoAuth';

export type AuthedUser = { id: string; role: 'SELLER' | 'ADMIN' };

declare global {
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

function bearerToken(req: Request): string | null {
  const raw = req.headers.authorization;
  if (!raw || typeof raw !== 'string') return null;
  const m = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return m ? m[1] : null;
}

/** Attach `req.user` when a valid demo Bearer token is present. */
export function attachDemoAuth(req: Request, _res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) {
    return next();
  }
  const payload = verifyDemoToken(token);
  if (!payload) {
    return next();
  }
  req.user = { id: payload.sub, role: payload.role };
  next();
}

export function requireSeller(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'SELLER') {
    return res.status(401).json({ error: 'Unauthorized. Sign in as a seller.' });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized. Sign in as an admin.' });
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. Sign in first.' });
  }
  next();
}
