import "./globals.css";
import { Toaster } from "@workspace/ui/components/sonner";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { SWRConfig } from "swr";
import { AnalyticsProvider } from "@/lib/analytics-client";
import { PerformanceMonitor } from "@/lib/monitoring";

import "@workspace/ui/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "SaaS Starter - Build Your SaaS Faster",
  description:
    "Professional SaaS starter with Next.js, Postgres, Stripe, and comprehensive dashboard features.",
  keywords:
    "SaaS, Next.js, Postgres, Stripe, dashboard, analytics, team management",
  authors: [{ name: "SaaS Starter" }],
  creator: "SaaS Starter",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-saas-domain.com",
    siteName: "SaaS Starter",
    title: "SaaS Starter - Build Your SaaS Faster",
    description: "Professional SaaS starter with comprehensive features",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SaaS Starter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Starter - Build Your SaaS Faster",
    description: "Professional SaaS starter with comprehensive features",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
  themeColor: "#f97316", // Orange theme color
};

const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <PerformanceMonitor />
        <AnalyticsProvider enableTracking={true} trackAdminPages={false}>
          <SWRConfig
            value={
              {
                // Remove direct function calls from fallback to avoid static rendering issues
                // Components will fetch data directly when needed
              }
            }
          >
            {children}
          </SWRConfig>
        </AnalyticsProvider>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
