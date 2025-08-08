import { Analytics } from "@workspace/ui/components/analytics";
import { Toaster } from "@workspace/ui/components/sonner";
import { TailwindIndicator } from "@workspace/ui/components/tailwind-indicator";
import { Geist, Geist_Mono } from "next/font/google";
//import '@workspace/ui/components/globals.css';
import { Providers } from "@/components/providers";

import "@workspace/ui/globals.css";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>{children}</Providers>
        <Analytics />
        <Toaster />
        <TailwindIndicator />
      </body>
    </html>
  );
}
