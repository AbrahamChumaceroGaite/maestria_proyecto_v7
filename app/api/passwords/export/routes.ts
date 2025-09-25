import { NextResponse } from 'next/server';
import { PasswordModel } from '../../../../lib/database/models';
import { withAuth, type AuthenticatedRequest } from '../../../../lib/auth/middleware';
import type { ApiResponse } from '../../../../lib/types';

async function handleGET(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const userId = req.user!.id;
    const passwords = PasswordModel.findByUserId(userId);
    
    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      user_id: userId,
      passwords: passwords.map(p => ({
        service: p.service,
        username: p.username,
        encrypted_password: p.encryptedPassword,
        iv: p.iv,
        url: p.url,
        notes: p.notes,
      }))
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="passwords-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error exportando contraseñas',
    }, { status: 500 });
  }
}

export const GET = withAuth(handleGET);