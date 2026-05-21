import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ImportStagingProvider } from "@/components/ImportStagingProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ImportStagingProvider>{children}</ImportStagingProvider>
      </body>
    </html>
  );
}
