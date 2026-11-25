import type { Metadata, Viewport } from "next";
import { Roboto_Mono, Nunito } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

// Small mono accents (codes, prices meta)
const robotoMono = Roboto_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto-mono",
});

// Body text, form labels and all digits (also the fallback for glyphs Eatvetica lacks)
const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
});

// Display/headings (.font-bebas). Used with the designer's written permission.
// No digits and no Romanian diacritics: digits render in Nunito, text goes through stripDiacritics.
const eatvetica = localFont({
  src: "./fonts/eatvetica.otf",
  variable: "--font-eatvetica",
  weight: "400",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  declarations: [{ prop: "unicode-range", value: "U+0020-002F, U+003A-007E, U+00A0-024F, U+2000-206F" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: "Burgeri făcuți pe loc, în Sector 6. Comandă direct, fără comisioane.",
    url: "/",
    siteName: SITE_NAME,
    locale: "ro_RO",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#332420",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={`${robotoMono.variable} ${nunito.variable} ${eatvetica.variable} antialiased font-nunito`}>
        {children}
      </body>
    </html>
  );
}
