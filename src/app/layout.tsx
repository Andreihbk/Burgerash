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
  title: "Burgerash | Nu facem medium. Facem crustă.",
  description: "Nu facem medium. Facem crustă. Smash burgeri din Sector 6, comandă direct, fără comisioane.",
  openGraph: {
    title: "Burgerash | Nu facem medium. Facem crustă.",
    description: "Smash burgeri din Sector 6. Comandă direct, fără comisioane.",
    locale: "ro_RO",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
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
