import { Toaster } from "@workspace/ui/components/sonner";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { SWRConfig } from "swr";
import I18nProvider from "@/components/I18nProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { AnalyticsProvider } from "@/lib/analytics-client";
import { PerformanceMonitor } from "@/lib/monitoring";

// IMPORTANT KEEP THESE LINES IN THIS ORDER
import "@workspace/ui/globals.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "Asset Evaluation - Smart Property Checklists for Home Buyers",
  description:
    "Make confident property decisions with smart checklists. Evaluate homes systematically, compare properties, and collaborate with family. Works offline.",
  keywords:
    "property evaluation, home buying checklist, real estate, property comparison, home inspection, smart checklist, property assessment",
  authors: [{ name: "Asset Evaluation" }],
  creator: "Asset Evaluation",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-asset-evaluation-domain.com",
    siteName: "Asset Evaluation",
    title: "Asset Evaluation - Smart Property Checklists for Home Buyers",
    description:
      "Make confident property decisions with smart checklists and systematic evaluation tools.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Asset Evaluation - Smart Property Checklists",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asset Evaluation - Smart Property Checklists for Home Buyers",
    description:
      "Make confident property decisions with smart checklists and systematic evaluation tools.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
  themeColor: "#2563eb", // Blue theme color for property evaluation
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
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-gray-50 dark:bg-gray-900 overflow-x-hidden max-w-full">
        <PerformanceMonitor />
        <I18nProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AnalyticsProvider enableTracking={false} trackAdminPages={false}>
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
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
