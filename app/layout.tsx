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
      <head>
        <title>{messages.metadata.title}</title>
        <meta name="description" content={messages.metadata.description} />
        <meta name="robots" content="index, follow" />
        <meta name="color-scheme" content="dark" />
        <meta
          name="google-site-verification"
          content="q4TWpuivuU8rC4wXGzN87Hw3W7C9ZEzAC-QvO0R6T98"
        />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:title" content={messages.metadata.ogTitle} />
        <meta
          property="og:description"
          content={messages.metadata.ogDescription}
        />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="IG Ratio" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={messages.metadata.ogTitle} />
        <meta
          name="twitter:description"
          content={messages.metadata.ogDescription}
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
