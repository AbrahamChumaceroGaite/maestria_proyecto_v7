'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dices, Copy, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { generatePasswordSchema } from '../../lib/utils/validation';
import { PASSWORD_GENERATOR_PRESETS } from '../../lib/utils/constants';
import { generatePassword } from '../../lib/crypto/generator';
import type { GeneratePasswordOptions } from '../../lib/types';

interface GeneratorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordGenerated: (password: string) => void;
}

export function GeneratorForm({ isOpen, onClose, onPasswordGenerated }: GeneratorFormProps) {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm<GeneratePasswordOptions>({
    resolver: zodResolver(generatePasswordSchema),
    defaultValues: PASSWORD_GENERATOR_PRESETS.MEDIUM,
  });

  const watchedValues = watch();

  const onSubmit = (data: GeneratePasswordOptions) => {
    try {
      const password = generatePassword(data);
      setGeneratedPassword(password);
    } catch (error) {
      console.error('Error generando contraseña:', error);
    }
  };

  const handleCopy = async () => {
    if (!generatedPassword) return;
    
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error copiando:', err);
    }
  };

  const handleUsePassword = () => {
    if (generatedPassword) {
      onPasswordGenerated(generatedPassword);
      onClose();
    }
  };

  const loadPreset = (preset: GeneratePasswordOptions) => {
    Object.entries(preset).forEach(([key, value]) => {
      setValue(key as keyof GeneratePasswordOptions, value);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dices className="h-5 w-5" />
            Generador de contraseñas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => loadPreset(PASSWORD_GENERATOR_PRESETS.WEAK)}
            >
              Básica
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => loadPreset(PASSWORD_GENERATOR_PRESETS.MEDIUM)}
            >
              Media
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => loadPreset(PASSWORD_GENERATOR_PRESETS.STRONG)}
            >
              Fuerte
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => loadPreset(PASSWORD_GENERATOR_PRESETS.PARANOID)}
            >
              Paranoia
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Longitud: {watchedValues.length}
              </label>
              <Controller
                name="length"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min="4"
                    max="50"
                    className="w-full"
                    {...field}
                  />
                )}
              />
              {errors.length && (
                <p className="text-sm text-destructive">{errors.length.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <Controller
                  name="includeUppercase"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded"
                    />
                  )}
                />
                <span className="text-sm">Mayúsculas (A-Z)</span>
              </label>

              <label className="flex items-center space-x-2">
                <Controller
                  name="includeLowercase"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded"
                    />
                  )}
                />
                <span className="text-sm">Minúsculas (a-z)</span>
              </label>

              <label className="flex items-center space-x-2">
                <Controller
                  name="includeNumbers"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded"
                    />
                  )}
                />
                <span className="text-sm">Números (0-9)</span>
              </label>

              <label className="flex items-center space-x-2">
                <Controller
                  name="includeSymbols"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded"
                    />
                  )}
                />
                <span className="text-sm">Símbolos (!@#$)</span>
              </label>
            </div>

            <label className="flex items-center space-x-2">
              <Controller
                name="excludeSimilar"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded"
                  />
                )}
              />
              <span className="text-sm">Excluir caracteres similares (il1Lo0O)</span>
            </label>

            <Button type="submit" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar contraseña
            </Button>
          </form>

          {generatedPassword && (
            <div className="space-y-3 p-4 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <Input
                  value={generatedPassword}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              {copySuccess && (
                <p className="text-sm text-green-600">¡Copiado!</p>
              )}

              <div className="flex gap-2">
                <Button onClick={handleUsePassword} className="flex-1">
                  Usar esta contraseña
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}