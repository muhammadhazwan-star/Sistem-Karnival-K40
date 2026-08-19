import type { Metadata } from "next";
import { Poppins, Cormorant_Garamond, Cinzel, Amiri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portal Digital Karnival 40 Tahun PPAAB",
  description:
    "Portal Digital Karnival 40 Tahun Pusat Pendidikan Al-Amin Berhad — One QR. One Carnival Experience. 23 Ogos 2026, Dewan Majestic Elissa Garden, Gombak, Selangor.",
  keywords: [
    "PPAAB",
    "Pusat Pendidikan Al-Amin",
    "Karnival 40 Tahun",
    "Al-Amin",
    "Digital Carnival",
    "Islamic Education Malaysia",
  ],
  authors: [{ name: "Pusat Pendidikan Al-Amin Berhad" }],
  openGraph: {
    title: "Portal Digital Karnival 40 Tahun PPAAB",
    description: "Membina Generasi Rabbani — Karnival 40 Tahun PPAAB, 23 Ogos 2026",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${cormorant.variable} ${cinzel.variable} ${amiri.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
        <SonnerToaster
          position="top-center"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(60, 18, 26, 0.95)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              color: "#faf3e0",
            },
          }}
        />
      </body>
    </html>
  );
}
