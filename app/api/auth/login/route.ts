import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserModel } from '../../../../lib/database/models';
import { hashMasterPassword, verifyMasterPassword } from '../../../../lib/crypto/hashing';
import { createSession } from '../../../../lib/auth/session';
import { loginSchema } from '../../../../lib/utils/validation';
import { VALIDATION_MESSAGES } from '../../../../lib/utils/constants';
import type { ApiResponse, AuthResponse } from '../../../../lib/types';
import { generateSalt } from '../../../../lib/crypto/encryption';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: validationResult.error.errors[0].message,
      }, { status: 400 });
    }

    const { email, masterPassword } = validationResult.data;

    const user = UserModel.findByEmail(email);
    if (!user) {
      // Auto-registro: crear usuario si no existe
      const masterPasswordHash = await hashMasterPassword(masterPassword);
      const salt = generateSalt();
      
      const newUser = UserModel.create({
        email,
        masterPasswordHash,
        salt,
      });
      
      const token = createSession(newUser.id, newUser.email);
      
      const cookieStore = cookies();
      cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/',
      });

      const authResponse: AuthResponse = {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      };

      return NextResponse.json<ApiResponse<AuthResponse>>({
        success: true,
        data: authResponse,
        message: 'Usuario registrado exitosamente',
      });
    }

    const isValidPassword = await verifyMasterPassword(masterPassword, user.masterPasswordHash);
    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: VALIDATION_MESSAGES.INVALID_CREDENTIALS,
      }, { status: 401 });
    }

    const token = createSession(user.id, user.email);
    
    const cookieStore = cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    const authResponse: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    return NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      data: authResponse,
      message: 'Inicio de sesión exitoso',
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: VALIDATION_MESSAGES.SERVER_ERROR,
    }, { status: 500 });
  }
}