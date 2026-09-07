import type { Metadata, Viewport } from "next";
import { Archivo, Bodoni_Moda, IBM_Plex_Mono, DotGothic16 } from "next/font/google";
import "@/styles/globals.css";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";
import { FrameChrome } from "@/components/motion/FrameChrome";
import { Nav } from "@/components/shell/Nav";
import { Overture } from "@/components/shell/Overture";
import { ThemeProvider } from "@/components/shell/ThemeProvider";
import { themeBootScript } from "@/lib/theme";
import { site } from "@/content/site";

// Display and body: one variable family with a live width axis.
// Swap for licensed Wild World via public/fonts and next/font/local if it arrives.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Voice: high-contrast italic for one-line statements.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["italic", "normal"],
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
});

// Technical: a normal width monospace with an editorial cut, for nav, the
// clock, labels, numerals and tables. It carries the whole metadata layer, so
// it has to read at 13px in a table without shouting.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

// HUD: pixel face for the frame timecode only.
const dotgothic = DotGothic16({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dotgothic",
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
    images: [{ url: "/images/hero/facade-night-wide.jpg", width: 1672, height: 941, alt: site.line }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevSoc",
    description: site.line,
    images: ["/images/hero/facade-night-wide.jpg"],
  },
  icons: { icon: "/images/brand/mark.png", apple: "/images/brand/window.png" },
};

export const viewport: Viewport = {
  themeColor: "#161310",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="night"
      suppressHydrationWarning
      className={`${archivo.variable} ${bodoni.variable} ${plexMono.variable} ${dotgothic.variable}`}
    >
      <head>
        {/* Applies the stored lighting before first paint, so night never flashes. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <ThemeProvider>
          <SmoothScroll>
            <Nav />
            {children}
          </SmoothScroll>
          <FrameChrome />
          <Overture />
          <Cursor />
          <div className="grain" aria-hidden="true" />
        </ThemeProvider>
      </body>
    </html>
  );
}
