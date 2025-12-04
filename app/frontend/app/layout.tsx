import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Restaurants E4 - Descubre y Reserva',
  description: 'Plataforma de búsqueda y reserva de restaurantes',
  openGraph: {
    title: 'Restaurants E4',
    description: 'Descubre los mejores restaurantes y reserva tu mesa',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
