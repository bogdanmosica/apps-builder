import "./globals.css";
import "@workspace/ui/globals.css";
import { Toaster } from "@workspace/ui/components/sonner";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { SWRConfig } from "swr";
import { getTeamForUser, getUser } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "RoProperty - Romanian Real Estate Platform",
  description:
    "Find your perfect property in Romania. Connect buyers, renters, and investors with quality real estate opportunities across Bucharest, Cluj-Napoca, and more.",
};

export const viewport: Viewport = {
  maximumScale: 1,
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
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              "/api/user": getUser(),
              "/api/team": getTeamForUser(),
            },
          }}
        >
          {children}
          <Toaster />
        </SWRConfig>
      </body>
    </html>
  );
}
