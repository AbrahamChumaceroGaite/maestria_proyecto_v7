import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserModel } from '../../../../lib/database/models';
import { hashMasterPassword } from '../../../../lib/crypto/hashing';
import { generateSalt } from '../../../../lib/crypto/encryption';
import { createSession } from '../../../../lib/auth/session';
import { registerSchema } from '../../../../lib/utils/validation';
import { VALIDATION_MESSAGES } from '../../../../lib/utils/constants';
import type { ApiResponse, AuthResponse } from '../../../../lib/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: validationResult.error.errors[0].message,
      }, { status: 400 });
    }

    const { email, masterPassword } = validationResult.data;

    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: VALIDATION_MESSAGES.USER_EXISTS,
      }, { status: 409 });
    }

    const masterPasswordHash = await hashMasterPassword(masterPassword);
    const salt = generateSalt();

    const user = UserModel.create({
      email,
      masterPasswordHash,
      salt,
    });

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
      message: 'Usuario registrado exitosamente',
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: VALIDATION_MESSAGES.SERVER_ERROR,
    }, { status: 500 });
  }
}