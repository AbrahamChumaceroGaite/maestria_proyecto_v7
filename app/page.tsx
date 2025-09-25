import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession } from '../lib/auth/session';
import { ROUTES } from '../lib/utils/constants';
import { LoginForm } from '../components/forms/LoginForm';

export default function HomePage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (sessionToken) {
    const session = verifySession(sessionToken);
    if (session) {
      redirect(ROUTES.DASHBOARD);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Bienvenido
          </h1>
          <p className="text-muted-foreground">
            Inicia sesión para acceder a tu gestor de contraseñas seguro
          </p>
        </div>
        <LoginForm />
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            UCB San Pablo - Modulo 7 Fundamentos de Ciberseguridad
          </p>
        </div>
      </div>
    </div>
  );
}