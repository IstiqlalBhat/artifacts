import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ImportStagingProvider } from "@/components/ImportStagingProvider";

const sans = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
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
      className={`${sans.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ImportStagingProvider>{children}</ImportStagingProvider>
      </body>
    </html>
  );
}
