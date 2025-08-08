import { DashboardHeader } from "@workspace/ui/components/header";
import { ProtectedRoute } from "@workspace/ui/components/protected-route";
import { DashboardShell } from "@workspace/ui/components/shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Edit compositions",
};

export default async function DashboardPage() {
  //const session = await auth();
  return (
    <ProtectedRoute redirectPath="dashboard" isUserAuthenticated={true}>
      <DashboardShell>
        <DashboardHeader
          heading="Dashboard"
          text="Create and manage compositions."
        />
      </DashboardShell>
    </ProtectedRoute>
  );
}
