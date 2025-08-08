import { redirect } from "next/navigation";
import EnhancedSettings from "@/components/enhanced-settings";
import { getSecurityData } from "@/lib/actions/get-security-data";
import { getTeamData } from "@/lib/actions/team-settings";
import { getUserSettingsData } from "@/lib/actions/user-settings";

// Force dynamic rendering since this page uses cookies for authentication
export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  const userData = await getUserSettingsData();

  if (!userData) {
    redirect("/login");
  }

  const teamData = await getTeamData();
  const securityData = await getSecurityData();

  return (
    <EnhancedSettings
      userData={userData}
      teamData={teamData}
      securityData={securityData}
    />
  );
}
