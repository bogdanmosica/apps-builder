import MarketingLanding from "@/components/marketing-landing";
import { getUser } from "@/lib/db/queries";

// Force dynamic rendering for pages that check user authentication
export const dynamic = "force-dynamic";

export default async function RootPage() {
  const user = await getUser();
  const isLoggedIn = !!user;
  const userRole = user?.role || null;

  return <MarketingLanding isLoggedIn={isLoggedIn} userRole={userRole} />;
}
