import type { Metadata, Viewport } from "next";
import { Roboto_Mono, Nunito } from "next/font/google";
import "./globals.css";
import FontPreview from "@/components/FontPreview";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

// Small mono accents (codes, prices meta)
const robotoMono = Roboto_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto-mono",
});

// Body text and form labels; also display/headings at weight 900 (temporary, until Eatvetica is licensed)
const nunito = Nunito({
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
      <body className={`${robotoMono.variable} ${nunito.variable} antialiased font-nunito`}>
        <FontPreview />
        {children}
      </body>
    </html>
  );
}
