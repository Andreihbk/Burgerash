import type { Metadata } from "next";
import { Bebas_Neue, Roboto_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "Burgerash | Raw. Gritty. Brutal Gustos.",
  description: "Cel mai bun smash burger din cartier.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={`${bebasNeue.variable} ${robotoMono.variable} antialiased font-roboto`}>
        {children}
      </body>
    </html>
  );
}