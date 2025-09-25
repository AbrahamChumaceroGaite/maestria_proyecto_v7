import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gestor de Contraseñas Seguro',
  description: 'Aplicación segura para gestionar y almacenar contraseñas con cifrado AES-256',
  keywords: ['gestor contraseñas', 'seguridad', 'cifrado', 'password manager'],
  authors: [{ name: 'UCB San Pablo - Modulo 7 Fundamentos de Ciberseguridad' }],
  robots: 'noindex, nofollow',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}