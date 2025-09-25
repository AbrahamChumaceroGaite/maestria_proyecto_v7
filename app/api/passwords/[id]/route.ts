import { NextRequest, NextResponse } from 'next/server';
import { PasswordModel, UserModel } from '../../../../lib/database/models';
import { encryptPassword, decryptPassword } from '../../../../lib/crypto/encryption';
import { withAuth, type AuthenticatedRequest } from '../../../../lib/auth/middleware';
import { updatePasswordSchema } from '../../../../lib/utils/validation';
import { isValidUUID } from '../../../../lib/utils/validation';
import { VALIDATION_MESSAGES } from '../../../../lib/utils/constants';
import type { ApiResponse, Password } from '../../../../lib/types';

interface RouteParams {
  params: {
    id: string;
  };
}

async function handleGET(req: AuthenticatedRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const userId = req.user!.id;
    const passwordId = params.id;

    if (!isValidUUID(passwordId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'ID de contraseña inválido',
      }, { status: 400 });
    }

    const password = PasswordModel.findById(passwordId, userId);
    if (!password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: VALIDATION_MESSAGES.PASSWORD_NOT_FOUND,
      }, { status: 404 });
    }

    const user = UserModel.findById(userId);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: VALIDATION_MESSAGES.USER_NOT_FOUND,
      }, { status: 404 });
    }

    try {
      const decryptedPassword = decryptPassword(
        password.encryptedPassword,
        password.iv,
        password.encryptedPassword.substring(0, 16),
        user.salt
      );

      return NextResponse.json<ApiResponse<{ decryptedPassword: string }>>({
        success: true,
        data: { decryptedPassword },
      });
    } catch (decryptError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Error descifrando la contraseña',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Get password error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: VALIDATION_MESSAGES.SERVER_ERROR,
    }, { status: 500 });
  }
}

async function handlePUT(req: AuthenticatedRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const body = await req.json();
    const userId = req.user!.id;
    const passwordId = params.id;

    if (!isValidUUID(passwordId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'ID de contraseña inválido',
      }, { status: 400 });
    }

    const validationResult = updatePasswordSchema.safeParse({ ...body, id: passwordId });
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: validationResult.error.errors[0].message,
      }, { status: 400 });
    }

    const existingPassword = PasswordModel.findById(passwordId, userId);
    if (!existingPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: VALIDATION_MESSAGES.PASSWORD_NOT_FOUND,
      }, { status: 404 });
    }

    const { password: newPlainPassword, ...updateData } = validationResult.data;
    let encryptedData;

    if (newPlainPassword) {
      const user = UserModel.findById(userId);
      if (!user) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: VALIDATION_MESSAGES.USER_NOT_FOUND,
        }, { status: 404 });
      }

      encryptedData = encryptPassword(newPlainPassword, newPlainPassword, user.salt);
    }

    const success = PasswordModel.update(passwordId, userId, updateData, encryptedData);
    
    if (!success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Error actualizando la contraseña',
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });

  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: VALIDATION_MESSAGES.SERVER_ERROR,
    }, { status: 500 });
  }
}

async function handleDELETE(req: AuthenticatedRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const userId = req.user!.id;
    const passwordId = params.id;

    if (!isValidUUID(passwordId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'ID de contraseña inválido',
      }, { status: 400 });
    }

    const existingPassword = PasswordModel.findById(passwordId, userId);
    if (!existingPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: VALIDATION_MESSAGES.PASSWORD_NOT_FOUND,
      }, { status: 404 });
    }

    const success = PasswordModel.delete(passwordId, userId);
    
    if (!success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Error eliminando la contraseña',
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Contraseña eliminada exitosamente',
    });

  } catch (error) {
    console.error('Delete password error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: VALIDATION_MESSAGES.SERVER_ERROR,
    }, { status: 500 });
  }
}

export const GET = withAuth(handleGET);
export const PUT = withAuth(handlePUT);
export const DELETE = withAuth(handleDELETE);