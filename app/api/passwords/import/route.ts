import { NextResponse } from 'next/server';
import { PasswordModel } from '../../../../lib/database/models';
import { withAuth, type AuthenticatedRequest } from '../../../../lib/auth/middleware';
import type { ApiResponse } from '../../../../lib/types';

async function handlePOST(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const userId = req.user!.id;
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No se encontró el archivo',
      }, { status: 400 });
    }

    const content = await file.text();
    const importData = JSON.parse(content);

    if (!importData.passwords || !Array.isArray(importData.passwords)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Formato de archivo inválido',
      }, { status: 400 });
    }

    let importedCount = 0;
    
    for (const passwordData of importData.passwords) {
      try {
        await PasswordModel.create(userId, {
          service: passwordData.service,
          username: passwordData.username,
          password: '', // Will be handled differently for imports
          url: passwordData.url,
          notes: passwordData.notes,
        }, {
          encryptedPassword: passwordData.encrypted_password,
          iv: passwordData.iv,
        });
        importedCount++;
      } catch (error) {
        console.error('Error importing password:', error);
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `${importedCount} contraseñas importadas exitosamente`,
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error importando contraseñas',
    }, { status: 500 });
  }
}

export const POST = withAuth(handlePOST);