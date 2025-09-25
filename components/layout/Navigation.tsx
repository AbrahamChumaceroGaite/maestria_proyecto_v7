'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Key, Settings, Download, Upload, Dices } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { GeneratorForm } from '../../components/forms/GeneratorForm';
import { cn } from '../../lib/utils';
import { ROUTES } from '../../lib/utils/constants';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: ROUTES.DASHBOARD,
    label: 'Mis contraseñas',
    icon: Key,
    description: 'Ver y gestionar tus contraseñas guardadas',
  },
];

const toolItems = [
  {
    id: 'generator',
    label: 'Generar contraseña',
    icon: Dices,
    description: 'Crear contraseñas seguras',
  },
  {
    id: 'export',
    label: 'Exportar datos',
    icon: Download,
    description: 'Descargar respaldo encriptado',
  },
  {
    id: 'import',
    label: 'Importar datos',
    icon: Upload,
    description: 'Restaurar desde respaldo',
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [showGenerator, setShowGenerator] = useState(false);

  const handleToolClick = (toolId: string) => {
    switch (toolId) {
      case 'generator':
        setShowGenerator(true);
        break;
      case 'export':
        handleExport();
        break;
      case 'import':
        handleImport();
        break;
      default:
        console.log('Tool not implemented:', toolId);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/passwords/export', {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passwords-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting passwords:', err);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/passwords/import', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (response.ok) {
          window.location.reload();
        }
      } catch (err) {
        console.error('Error importing passwords:', err);
      }
    };
    input.click();
  };

  const handlePasswordGenerated = (password: string) => {
    navigator.clipboard.writeText(password);
    setShowGenerator(false);
  };

  return (
    <>
      <aside className="w-64 border-r bg-muted/40 p-6 hidden lg:block">
        <nav className="space-y-6">
          <div>
            <h2 className="mb-3 px-3 text-lg font-semibold tracking-tight">
              Navegación
            </h2>
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start h-auto p-3',
                        isActive && 'bg-secondary'
                      )}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-3 px-3 text-lg font-semibold tracking-tight">
              Herramientas
            </h2>
            <div className="space-y-1">
              {toolItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleToolClick(item.id)}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="text-sm">
              <div className="font-semibold text-primary mb-2">
                Tip de seguridad
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Usa contraseñas únicas para cada servicio y actualízalas 
                regularmente para mantener tu seguridad.
              </p>
            </div>
          </Card>
        </nav>
      </aside>

      <GeneratorForm
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onPasswordGenerated={handlePasswordGenerated}
      />
    </>
  );
}