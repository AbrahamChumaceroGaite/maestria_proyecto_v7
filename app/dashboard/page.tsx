import { Metadata } from 'next';
import { PasswordList } from '../../components/dashboard/PasswordList';

export const metadata: Metadata = {
  title: 'Dashboard - Gestor de Contraseñas',
  description: 'Gestiona tus contraseñas de forma segura',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Gestiona tus contraseñas de forma segura y organizada
        </p>
      </div>
      
      <PasswordList />
    </div>
  );
}