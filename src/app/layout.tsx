import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Cargamos la fuente Inter (Estándar profesional)
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexusHR - Gestión de Recursos",
  description: "Dashboard RAD para gestión empresarial",
};

import { ThemeProvider } from '@/components/ThemeProvider';

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}