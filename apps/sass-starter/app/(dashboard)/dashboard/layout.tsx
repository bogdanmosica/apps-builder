"use client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout now passes through children without adding navigation
  // since our dashboard components include their own modern navigation
  return <>{children}</>;
}
