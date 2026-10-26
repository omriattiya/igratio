import { ColorSchemeScript } from "@mantine/core";
import { Geist, Geist_Mono } from "next/font/google";
import { preload } from "react-dom";
import { AppProviders } from "@/components/AppProviders";
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
      data-mantine-color-scheme="dark"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Dev preview tags nodes with data-cursor-ref before hydration. */}
        {process.env.NODE_ENV === "development" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var ATTR="data-cursor-ref";function strip(el){if(el&&el.hasAttribute&&el.hasAttribute(ATTR))el.removeAttribute(ATTR)}function stripAll(root){strip(root);if(!root.querySelectorAll)return;var nodes=root.querySelectorAll("["+ATTR+"]");for(var i=0;i<nodes.length;i++)nodes[i].removeAttribute(ATTR)}var setAttribute=Element.prototype.setAttribute;Element.prototype.setAttribute=function(name,value){if(name===ATTR)return;return setAttribute.call(this,name,value)};var setAttributeNS=Element.prototype.setAttributeNS;Element.prototype.setAttributeNS=function(ns,name,value){if(name===ATTR||name==="cursor-ref")return;return setAttributeNS.call(this,ns,name,value)};var root=document.documentElement;var obs=new MutationObserver(function(){stripAll(root)});obs.observe(root,{subtree:true,attributes:true,childList:true,attributeFilter:[ATTR]});var timer=setInterval(function(){stripAll(root)},16);setTimeout(function(){clearInterval(timer);obs.disconnect();Element.prototype.setAttribute=setAttribute;Element.prototype.setAttributeNS=setAttributeNS},8000)})();`,
            }}
          />
        ) : null}
        <ColorSchemeScript forceColorScheme="dark" />
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
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
