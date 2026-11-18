import type { Metadata } from "next";
import { Bebas_Neue, Roboto_Mono, Nunito } from "next/font/google";
import "./globals.css";

// Display / headings
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-bebas-neue",
});

// Small mono accents (codes, prices meta)
const robotoMono = Roboto_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto-mono",
});

// Body text and form labels
const nunito = Nunito({
  weight: ["400", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
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
      <body className={`${bebasNeue.variable} ${robotoMono.variable} ${nunito.variable} antialiased font-nunito`}>
        {children}
      </body>
    </html>
  );
}
