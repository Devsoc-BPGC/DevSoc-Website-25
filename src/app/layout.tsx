import type { Metadata, Viewport } from "next";
import { Archivo, Bodoni_Moda, Martian_Mono, DotGothic16 } from "next/font/google";
import "@/styles/globals.css";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";
import { FrameChrome } from "@/components/motion/FrameChrome";
import { Nav } from "@/components/shell/Nav";
import { Overture } from "@/components/shell/Overture";
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

// Technical: a wide monospace grotesque with a width axis (the Heming role).
const martian = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-martian",
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
  },
  twitter: { card: "summary_large_image", title: "DevSoc", description: site.line },
  icons: { icon: "/images/brand/mark.png" },
};

export const viewport: Viewport = {
  themeColor: "#161310",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${bodoni.variable} ${martian.variable} ${dotgothic.variable}`}
    >
      <body>
        <SmoothScroll>
          <Nav />
          {children}
        </SmoothScroll>
        <FrameChrome />
        <Overture />
        <Cursor />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
