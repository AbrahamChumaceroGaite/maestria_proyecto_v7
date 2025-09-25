import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import type { SessionUser } from '../types';
import { JWT_CONFIG } from '../utils/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

export function createSession(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { 
      expiresIn: JWT_CONFIG.EXPIRES_IN,
      algorithm: JWT_CONFIG.ALGORITHM as jwt.Algorithm
    }
  );
}

export function verifySession(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    
    return {
      id: decoded.userId,
      email: decoded.email,
      iat: decoded.iat!,
      exp: decoded.exp!,
    };
  } catch {
    return null;
  }
}

export function getSessionFromCookies(): SessionUser | null {
  const cookieStore = cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) return null;
  
  return verifySession(token);
}

export function setSessionCookie(token: string): void {
  const cookieStore = cookies();
  
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
    path: '/',
  });
}

export function clearSessionCookie(): void {
  const cookieStore = cookies();
  
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export function isSessionExpired(session: SessionUser): boolean {
  const now = Math.floor(Date.now() / 1000);
  return session.exp < now;
}

export function getSessionRemainingTime(session: SessionUser): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, session.exp - now);
}