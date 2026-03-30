import type { Metadata } from "next";
import { Bebas_Neue, Roboto_Mono, Nunito } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// 1. Fonturile vechi (rămân la fel)
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

// 2. NOU: Fontul de la Google pentru descrieri (Nunito)
const nunito = Nunito({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-nunito",
});

// 3. NOU: Fontul local pentru titluri (Eatvetica)
const eatvetica = localFont({
  src: "../fonts/eatvetica.otf", // Trebuie să ai fișierul în src/fonts/eatvetica.otf
  variable: "--font-eatvetica",
});

export const metadata: Metadata = {
  title: "Burgerash | Foc. Presa. Crustă.",
  description: "Cel mai bun smash burger din cartier.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      {/* Clasa body combină toate fonturile și adaugă antialiasing pentru o textură mai fină */}
      <body className={`${bebasNeue.variable} ${robotoMono.variable} ${nunito.variable} ${eatvetica.variable} antialiased font-roboto`}>
        {children}
      </body>
    </html>
  );
}