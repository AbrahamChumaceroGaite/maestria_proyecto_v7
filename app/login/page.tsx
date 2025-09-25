import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession } from '../../lib/auth/session';
import { ROUTES } from '../../lib/utils/constants';
import { LoginForm } from '../../components/forms/LoginForm';

export default function LoginPage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (sessionToken) {
    const session = verifySession(sessionToken);
    if (session) {
      redirect(ROUTES.DASHBOARD);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Iniciar sesión
          </h1>
          <p className="text-muted-foreground">
            Accede a tu bóveda de contraseñas segura
          </p>
        </div>
        
        <LoginForm />
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Crea tu cuenta con tu primera contraseña, no hay formulario de registro
          </p>
          <p className="text-xs text-muted-foreground">
            Proyecto - Fundamentos de Ciberseguridad
          </p>
        </div>
      </div>
    </div>
  );
}