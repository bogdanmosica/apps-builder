import { redirect } from "next/navigation";
import AdvancedAnalytics from "@/components/advanced-analytics-new";
import { getSession } from "@/lib/auth/session";

// Force dynamic rendering for authenticated pages
export const dynamic = "force-dynamic";

export default async function AdvancedAnalyticsPage() {
  const session = await getSession();

  // Redirect if not logged in
  if (!session) {
    redirect("/login");
  }

  // Only allow admin users to access advanced analytics
  if (session.user.role !== "admin" && session.user.role !== "owner") {
    redirect("/dashboard");
  }

  return <AdvancedAnalytics />;
}
