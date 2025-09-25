'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PasswordItem } from './PasswordItem';
import { SearchBar } from './SearchBar';
import { PasswordForm } from '../../components/forms/PasswordForm';
import { API_ROUTES } from '../../lib/utils/constants';
import type { Password, ApiResponse } from '../../lib/types';

export function PasswordList() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [filteredPasswords, setFilteredPasswords] = useState<Password[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | undefined>();

  useEffect(() => {
    loadPasswords();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPasswords(passwords);
    } else {
      const filtered = passwords.filter(password =>
        password.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        password.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        password.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        password.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPasswords(filtered);
    }
  }, [searchQuery, passwords]);

  const loadPasswords = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(API_ROUTES.PASSWORDS.BASE, {
        credentials: 'include',
      });

      const result: ApiResponse<Password[]> = await response.json();

      if (!result.success) {
        setError(result.error || 'Error cargando contraseñas');
        return;
      }

      setPasswords(result.data || []);
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordDeleted = (deletedId: string) => {
    setPasswords(prev => prev.filter(p => p.id !== deletedId));
  };

  const handleEditPassword = (password: Password) => {
    setEditingPassword(password);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPassword(undefined);
  };

  const handleFormSuccess = () => {
    loadPasswords();
    setIsFormOpen(false);
    setEditingPassword(undefined);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando contraseñas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-destructive">
            <p className="mb-4">{error}</p>
            <Button onClick={loadPasswords} variant="outline">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl">Contraseñas guardadas</CardTitle>
            <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Agregar contraseña
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por servicio, usuario o URL..."
          />

          {filteredPasswords.length === 0 ? (
            <div className="text-center py-8">
              {searchQuery ? (
                <div>
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
                  <p className="text-muted-foreground">
                    Intenta con otros términos de búsqueda
                  </p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No hay contraseñas guardadas</h3>
                  <p className="text-muted-foreground mb-4">
                    Comienza agregando tu primera contraseña
                  </p>
                  <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar contraseña
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPasswords.map((password) => (
                <PasswordItem
                  key={password.id}
                  password={password}
                  onEdit={handleEditPassword}
                  onDeleted={handlePasswordDeleted}
                />
              ))}
            </div>
          )}

          {filteredPasswords.length > 0 && (
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              {filteredPasswords.length} de {passwords.length} contraseñas
              {searchQuery && ' (filtradas)'}
            </div>
          )}
        </CardContent>
      </Card>

      <PasswordForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        password={editingPassword}
        isEditing={!!editingPassword}
      />
    </>
  );
}