import { NextRequest, NextResponse } from 'next/server';
import { verifySession, isSessionExpired } from './session';
import { ROUTES } from '../utils/constants';
import type { SessionUser } from '../types';

export interface AuthenticatedRequest extends NextRequest {
  user?: SessionUser;
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse> | NextResponse) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const token = req.cookies.get('session')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }
    
    const session = verifySession(token);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }
    
    if (isSessionExpired(session)) {
      return NextResponse.json(
        { success: false, error: 'Sesión expirada' },
        { status: 401 }
      );
    }
    
    const authReq = req as AuthenticatedRequest;
    authReq.user = session;
    
    return handler(authReq);
  };
}

export function requireAuth(req: NextRequest): SessionUser | null {
  const token = req.cookies.get('session')?.value;
  
  if (!token) return null;
  
  const session = verifySession(token);
  
  if (!session || isSessionExpired(session)) return null;
  
  return session;
}

export function redirectIfAuthenticated(req: NextRequest): NextResponse | null {
  const session = requireAuth(req);
  
  if (session) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url));
  }
  
  return null;
}

export function redirectIfNotAuthenticated(req: NextRequest): NextResponse | null {
  const session = requireAuth(req);
  
  if (!session) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
  }
  
  return null;
}

export function createAuthMiddleware() {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { pathname } = req.nextUrl;
    
    if (pathname === ROUTES.LOGIN || pathname === ROUTES.HOME) {
      const redirect = redirectIfAuthenticated(req);
      if (redirect) return redirect;
    }
    
    if (pathname.startsWith('/dashboard')) {
      const redirect = redirectIfNotAuthenticated(req);
      if (redirect) return redirect;
    }
    
    return NextResponse.next();
  };
}