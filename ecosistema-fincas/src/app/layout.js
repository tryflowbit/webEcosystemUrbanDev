import './globals.css';

export const metadata = {
  title: 'Fincas del Plata | Panel de Gestión',
  description: 'Sistema de administración de lotes y cobros',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}