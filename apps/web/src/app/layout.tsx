import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Koda 🦊 — Aprende a programar desde cero',
  description:
    'Plataforma educativa interactiva y gamificada para aprender desarrollo de software con micro-lecciones accesibles.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-950 text-slate-100 flex min-h-screen antialiased">
        <Sidebar />
        <main className="ml-64 flex-1 min-h-screen p-8 max-w-6xl">{children}</main>
      </body>
    </html>
  );
}
