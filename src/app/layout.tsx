import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Roboto_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

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
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: "Smash burgeri din Sector 6. Comandă direct, fără comisioane.",
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
      <body className={`${bebasNeue.variable} ${robotoMono.variable} ${nunito.variable} antialiased font-nunito`}>
        {children}
      </body>
    </html>
  );
}
