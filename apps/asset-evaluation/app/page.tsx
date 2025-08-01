import { getUser } from '@/lib/db/queries';
import MarketingLanding from '@/components/marketing-landing';

// Force dynamic rendering for pages that check user authentication
export const dynamic = 'force-dynamic';

export default async function RootPage() {
  let user = null;
  let isLoggedIn = false;
  let userRole = null;

  try {
    user = await getUser();
    isLoggedIn = !!user;
    userRole = user?.role || null;
  } catch (error) {
    // Handle database connection errors gracefully
    console.log('Database connection error, showing landing page for non-authenticated users');
    isLoggedIn = false;
    userRole = null;
  }

  return (
    <MarketingLanding 
      isLoggedIn={isLoggedIn} 
      userRole={userRole} 
    />
  );
}
