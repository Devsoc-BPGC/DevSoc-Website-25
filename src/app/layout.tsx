import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Schibsted_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";
import { Directory } from "@/components/shell/Directory";
import { OVERTURE_EARLY } from "@/components/scenes/overtureEarly";
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

// Icons and the share image are files in this folder (favicon.ico, icon.png,
// apple-icon.png, opengraph-image.jpg, twitter-image.jpg), which Next picks
// up by name; scripts/make-og.py draws the share image.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "DevSoc, Developers' Society of BITS Pilani Goa", template: "%s. DevSoc" },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "DevSoc",
    "Developers' Society",
    "BITS Pilani Goa",
    "BITS Goa",
    "K.K. Birla Goa Campus",
    "student developers",
    "DevFest",
    "Waves",
    "Quark",
    "hackathon",
  ],
  authors: [{ name: site.fullName, url: site.url }],
  creator: site.fullName,
  publisher: site.fullName,
  category: "technology",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: "DevSoc",
    description: site.description,
    url: site.url,
    siteName: site.fullName,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevSoc",
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0e0c",
  width: "device-width",
  initialScale: 1,
  // Lets the safe-area insets work: the chrome keeps clear of a notch or a
  // home indicator in landscape and when installed.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The overture's early script marks <html> before hydration on a visit that
    // has already seen it; that one class is expected to differ.
    <html lang="en" className={`${shoulders.variable} ${schibsted.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: OVERTURE_EARLY }} />
      </head>
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
