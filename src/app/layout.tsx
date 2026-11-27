import type { Metadata, Viewport } from "next";
import { Roboto_Mono, Nunito } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import SiteAnalytics from "@/components/SiteAnalytics";

// Small mono accents (codes, prices meta). Not preloaded: it is never in the first screen's big text,
// so it should not compete with Nunito and Eatvetica for bandwidth (audit R4).
const robotoMono = Roboto_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto-mono",
  display: "swap",
  preload: false,
});

// Body text, form labels and all digits (also the fallback for glyphs Eatvetica lacks)
const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
  display: "swap",
});

// Display/headings (.font-bebas). Used with the designer's written permission.
// No digits and no Romanian diacritics: digits render in Nunito, text goes through stripDiacritics.
// WOFF2 subset of docs/brand/fonts/eatvetica.otf to the unicode-range below (208 KB -> 22 KB, audit R4).
// To rebuild: pyftsubset docs/brand/fonts/eatvetica.otf --unicodes="U+0020-002F,U+003A-007E,U+00A0-024F,U+2000-206F"
//   --flavor=woff2 --layout-features='*' --output-file=src/app/fonts/eatvetica.woff2
const eatvetica = localFont({
  src: "./fonts/eatvetica.woff2",
  variable: "--font-eatvetica",
  weight: "400",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  declarations: [{ prop: "unicode-range", value: "U+0020-002F, U+003A-007E, U+00A0-024F, U+2000-206F" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  // Google Search Console "HTML tag" method: set GOOGLE_SITE_VERIFICATION in Vercel (the code from content="...").
  ...(process.env.GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  }),
  openGraph: {
    title: SITE_TITLE,
    description: "Burgeri din carne proaspătă, făcuți pe loc în Sector 6. Comandă direct, fără comisioane.",
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
        <SiteAnalytics />
      </body>
    </html>
  );
}
