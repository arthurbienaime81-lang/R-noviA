import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Requis pour une CSP par nonce (voir src/proxy.ts) : une page
// pré-rendue statiquement fige son nonce au moment du build, qui ne peut
// alors plus jamais correspondre au nonce généré à chaque requête — le
// navigateur bloquerait alors tous les scripts, y compris ceux de Next.js
// lui-même. Next.js documente ce compromis comme la contrepartie normale
// d'une CSP par nonce.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chantivia — Gestion de chantiers TCE",
  description:
    "Chantivia, l'outil de gestion de chantiers pour les entreprises de rénovation tous corps d'état.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
