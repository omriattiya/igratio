import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { preload } from "react-dom";
import { messages } from "@/lib/i18n";
import { TUTORIAL_IMAGES } from "@/lib/tutorialImages";
import "./globals.css";

for (const { src } of TUTORIAL_IMAGES) {
  preload(src, { as: "image" });
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://igratio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: messages.metadata.title,
  description: messages.metadata.description,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: messages.metadata.ogTitle,
    description: messages.metadata.ogDescription,
    url: siteUrl,
    siteName: "IG Ratio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: messages.metadata.ogTitle,
    description: messages.metadata.ogDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "q4TWpuivuU8rC4wXGzN87Hw3W7C9ZEzAC-QvO0R6T98",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
