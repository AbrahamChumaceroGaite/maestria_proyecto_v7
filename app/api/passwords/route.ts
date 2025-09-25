import { NextRequest, NextResponse } from 'next/server';
import { PasswordModel, UserModel } from '../../../lib/database/models';
import { encryptPassword, decryptPassword } from '../../../lib/crypto/encryption';
import { withAuth, type AuthenticatedRequest } from '../../../lib/auth/middleware';
import { createPasswordSchema } from '../../../lib/utils/validation';
import { VALIDATION_MESSAGES } from '../../../lib/utils/constants';
import type { ApiResponse, Password } from '../../../lib/types';

async function handleGET(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const userId = req.user!.id;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let passwords: Password[];
    
    if (search) {
      passwords = PasswordModel.search(userId, search);
    } else {
      passwords = PasswordModel.findByUserId(userId);
    }

    return NextResponse.json<ApiResponse<Password[]>>({
      success: true,
      data: passwords,
    });

  } catch (error) {
    console.error('Get passwords error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: VALIDATION_MESSAGES.SERVER_ERROR,
    }, { status: 500 });
  }
}

async function handlePOST(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const userId = req.user!.id;

    const validationResult = createPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: validationResult.error.errors[0].message,
      }, { status: 400 });
    }

    const user = UserModel.findById(userId);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: VALIDATION_MESSAGES.USER_NOT_FOUND,
      }, { status: 404 });
    }

    const { password: plainPassword, ...passwordData } = validationResult.data;

    const encryptedData = encryptPassword(plainPassword, plainPassword, user.salt);

    const createdPassword = PasswordModel.create(userId, passwordData, encryptedData);

    return NextResponse.json<ApiResponse<Password>>({
      success: true,
      data: createdPassword,
      message: 'Contraseña guardada exitosamente',
    }, { status: 201 });

  } catch (error) {
    console.error('Create password error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: VALIDATION_MESSAGES.SERVER_ERROR,
    }, { status: 500 });
  }
}

export const GET = withAuth(handleGET);
export const POST = withAuth(handlePOST);