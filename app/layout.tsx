import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Curso de Barbería | Aaron Dalla Rosa",
  description: "Aprendé barbería con clases nuevas cada semana. Acceso inmediato.",
};

// Sin zoom accidental: el celular no amplía la página al tocar o con dos dedos.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-bg font-sans text-ink">{children}</body>
    </html>
  );
}
