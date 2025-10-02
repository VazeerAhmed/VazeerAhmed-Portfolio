import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/footer";
import { BASE_URL } from "@/lib/constants";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Header } from "@/components/header";

import "@/app/global.css";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Hugo Lin Dev",
  description: "Hugo Lin's Dev Blog",
  openGraph: {
    title: "Hugo Lin Dev",
    description: "Hugo Lin's Dev Blog",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Hugo Lin Dev",
      },
    ],
    url: BASE_URL,
    siteName: "Hugo Lin Dev",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    site: "@1chooo___",
    card: "summary_large_image",
    title: "Hugo Lin Dev",
    description: "Hugo Lin's Dev Blog",
    images: [
      {
        url: "/twitter-image",
        width: 1200,
        height: 630,
        alt: "Hugo Lin Dev",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/favicon.ico",
        sizes: "192x192",
        type: "image/x-icon",
      },
    ],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
};

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cx(
        "text-neutral-900 bg-neutral-50 dark:text-neutral-50 dark:bg-neutral-900",
        GeistSans.variable,
        GeistMono.variable,
      )}
    >
      <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID!} />
      <body className="antialiased max-w-xl mx-4 sm:mx-auto">
        <Header />
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
