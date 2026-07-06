import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Lobster, Noto_Sans, Poppins } from "next/font/google";
import "./globals.css";
import { ImportStagingProvider } from "@/components/ImportStagingProvider";

// Noto Sans — body copy (suncoast.studio body face)
const sans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Poppins — Suncoast's display/UI face (headings, nav, buttons)
const display = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Lobster — the warm script used for Suncoast's emotional headlines
const script = Lobster({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// Plex Mono — file names + code, only inside the tool surfaces
const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#165a5b",
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Artifacts — upload, render, share",
    template: "%s — Artifacts",
  },
  description:
    "Upload HTML, CSS, JS, or JSX. Render it in a sandbox. Send the running thing with a link.",
  openGraph: {
    title: "Artifacts",
    description:
      "Upload HTML, CSS, JS, or JSX. Render it in a sandbox. Send the running thing with a link.",
    type: "website",
    siteName: "Artifacts",
  },
  twitter: {
    card: "summary",
    title: "Artifacts",
    description: "Upload code. Render in a sandbox. Send the running thing.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${script.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ImportStagingProvider>{children}</ImportStagingProvider>
      </body>
    </html>
  );
}
