import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { ApiResponse } from '../../../../lib/types';

export async function POST(): Promise<NextResponse> {
  const cookieStore = cookies();
  
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return NextResponse.json<ApiResponse>({
    success: true,
    message: 'Sesión cerrada exitosamente',
  });
}