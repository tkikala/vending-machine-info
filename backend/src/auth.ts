import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create session
export async function createSession(userId: number) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
  
  return session;
}

// Verify session
export async function verifySession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }
  
  return session;
}

// Clean expired sessions
export async function cleanExpiredSessions() {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

// Authentication middleware
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.session;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const session = await verifySession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    req.user = session.user;
    req.session = session;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

// Admin-only middleware
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Owner or admin middleware (for machine management)
export async function requireOwnerOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role === 'ADMIN') {
    return next();
  }
  
  // For machine-specific routes, check if user owns the machine
  const machineId = req.params.id || req.body.id;
  if (machineId) {
    const machine = await prisma.vendingMachine.findUnique({
      where: { id: machineId },
      select: { ownerId: true },
    });
    
    if (!machine || machine.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  next();
} 