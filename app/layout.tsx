import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileNav from "@/components/layout/mobile-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bookeo - Reserva tu Estilo",
  description: "La mejor app de reservas para barberías, salones y spas en República Dominicana",
};

import Header from "@/components/layout/header";

// ... (keep existing imports)

import AuthProvider from '@/components/providers/auth-provider'

// ... (keep existing imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen pb-20`}>
        <AuthProvider>
          <main className="min-h-screen bg-zinc-900 relative overflow-hidden">
            <Header />
            {children}
            <MobileNav />
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
