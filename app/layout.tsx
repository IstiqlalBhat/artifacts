import type { Metadata } from "next";
import { Geist, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ImportStagingProvider } from "@/components/ImportStagingProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Artifacts - upload, render, share",
    template: "%s - Artifacts",
  },
  description:
    "Upload HTML, CSS, JS, or JSX. Render it beautifully in a sandbox. Share it with a link.",
  openGraph: {
    title: "Artifacts",
    description:
      "Upload HTML, CSS, JS, or JSX. Render it beautifully in a sandbox. Share it with a link.",
    type: "website",
    siteName: "Artifacts",
  },
  twitter: {
    card: "summary",
    title: "Artifacts",
    description: "Upload code. Render in a sandbox. Share the link.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ImportStagingProvider>{children}</ImportStagingProvider>
      </body>
    </html>
  );
}
