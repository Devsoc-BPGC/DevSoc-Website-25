import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Schibsted_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";
import { Directory } from "@/components/shell/Directory";
import { site } from "@/content/site";

// Display: condensed civic signage. Everything that should read as a sign, a
// stamp or a poster. The optical size axis lets the same family stay open at
// label sizes and tighten at poster sizes.
//
// Loaded blocking, not swapped. The rooftop sign is sized from this face's own
// proportions, and Next has no fallback metrics for it, so a swap would draw
// the sign first in a stand-in face at the wrong width and then jump. It is
// self-hosted and preloaded, so the block is short.
const shoulders = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-shoulders",
  display: "block",
  adjustFontFallback: false,
});

// Body and data: a newspaper grotesk built for long reading. There is no mono
// on this site; numbers are this face with tabular figures.
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "DevSoc", template: "%s. DevSoc" },
  description: site.description,
  openGraph: {
    title: "DevSoc",
    description: site.line,
    url: site.url,
    siteName: site.fullName,
    type: "website",
    locale: "en_IN",
    images: [{ url: "/images/graded/hero-facade-night-wide.jpg", width: 1672, height: 941, alt: site.line }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevSoc",
    description: site.line,
    images: ["/images/graded/hero-facade-night-wide.jpg"],
  },
  icons: { icon: "/images/brand/mark.png", apple: "/images/brand/window.png" },
};

export const viewport: Viewport = {
  themeColor: "#0d0e0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${shoulders.variable} ${schibsted.variable}`}>
      <body>
        <SmoothScroll>
          <Directory />
          {children}
        </SmoothScroll>
        <Cursor />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
