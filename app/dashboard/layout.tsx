import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession, isSessionExpired } from '../../lib/auth/session';
import { ROUTES } from '../../lib/utils/constants';
import { Header } from '../../components/layout/Header';
import { Navigation } from '../../components/layout/Navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) {
    redirect(ROUTES.LOGIN);
  }

  const session = verifySession(sessionToken);
  
  if (!session || isSessionExpired(session)) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userEmail={session.email} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}