import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RentCar Enterprise | Plateforme Premium de Location de Voitures",
  description: "Plateforme de gestion de location de voitures professionnelle. Réservez des véhicules de luxe, gérez votre flotte et développez votre entreprise.",
  keywords: ["location de voitures", "voitures de luxe", "gestion de flotte", "réservation de véhicules"],
  authors: [{ name: "RentCar Enterprise" }],
  openGraph: {
    title: "RentCar Enterprise | Plateforme Premium de Location de Voitures",
    description: "Plateforme de gestion de location de voitures professionnelle",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Providers>
            {children}
          </Providers>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              className: "border-border",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
