'use client';

import { useState } from 'react';
import { Copy, Edit, Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { API_ROUTES } from '../../lib/utils/constants';
import { decryptPassword } from '../../lib/crypto/encryption';
import type { Password, ApiResponse } from '../../lib/types';

interface PasswordItemProps {
  password: Password;
  onEdit: (password: Password) => void;
  onDeleted: (passwordId: string) => void;
}

export function PasswordItem({ password, onEdit, onDeleted }: PasswordItemProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleTogglePassword = async () => {
    if (showPassword) {
      setShowPassword(false);
      setDecryptedPassword(null);
      return;
    }

    setIsDecrypting(true);
    try {
      const response = await fetch(API_ROUTES.PASSWORDS.BY_ID(password.id), {
        credentials: 'include',
      });

      const result: ApiResponse<{ decryptedPassword: string }> = await response.json();

      if (result.success && result.data) {
        setDecryptedPassword(result.data.decryptedPassword);
        setShowPassword(true);
      }
    } catch (err) {
      console.error('Error decrypting password:', err);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!decryptedPassword) {
      await handleTogglePassword();
      return;
    }

    try {
      await navigator.clipboard.writeText(decryptedPassword);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText(password.username);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(API_ROUTES.PASSWORDS.BY_ID(password.id), {
        method: 'DELETE',
        credentials: 'include',
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        onDeleted(password.id);
        setShowDeleteDialog(false);
      }
    } catch (err) {
      console.error('Error deleting password:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg truncate">{password.service}</h3>
                {password.url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-1 h-auto"
                    onClick={() => window.open(password.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Usuario:</span>
                  <span className="truncate flex-1">{password.username}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-1 h-auto"
                    onClick={handleCopyUsername}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">Contraseña:</span>
                  <span className="font-mono flex-1">
                    {isDecrypting 
                      ? 'Descifrando...'
                      : showPassword && decryptedPassword 
                        ? decryptedPassword
                        : '••••••••••••'
                    }
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1 h-auto"
                      onClick={handleTogglePassword}
                      disabled={isDecrypting}
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1 h-auto"
                      onClick={handleCopyPassword}
                      disabled={isDecrypting}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {password.notes && (
                  <div>
                    <span className="font-medium">Notas:</span>
                    <p className="text-xs mt-1 p-2 bg-muted rounded text-muted-foreground">
                      {password.notes}
                    </p>
                  </div>
                )}

                <div className="text-xs">
                  Creado: {formatDate(password.createdAt)}
                  {password.updatedAt.getTime() !== password.createdAt.getTime() && (
                    <span className="ml-2">
                      • Modificado: {formatDate(password.updatedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(password)}
                className="px-3"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="px-3 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {copyStatus === 'success' && (
            <div className="mt-2 text-xs text-green-600">
              ¡Copiado al portapapeles!
            </div>
          )}

          {copyStatus === 'error' && (
            <div className="mt-2 text-xs text-destructive">
              Error al copiar
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la contraseña de "{password.service}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}