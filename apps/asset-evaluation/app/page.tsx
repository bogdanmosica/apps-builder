import { getUser, getUserEvaluations, getUserEvaluationStats } from '@/lib/db/queries';
import MarketingLanding from '@/components/marketing-landing';
import EvaluationsOverview from '@/components/evaluations/EvaluationsOverview';
import AuthWrapper from '@/components/auth-wrapper';

// Force dynamic rendering for pages that check user authentication
export const dynamic = 'force-dynamic';

export default async function RootPage() {
  let user = null;
  let isLoggedIn = false;
  let userRole = null;
  let evaluations: any[] = [];
  let stats = {
    totalEvaluations: 0,
    averageScore: 0,
    bestScore: 0,
    completionRate: 0,
  };

  try {
    user = await getUser();
    isLoggedIn = !!user;
    userRole = user?.role || null;
    
    // If user is logged in, fetch their evaluations
    if (isLoggedIn) {
      const [userEvaluations, userStats] = await Promise.all([
        getUserEvaluations(),
        getUserEvaluationStats(),
      ]);
      
      evaluations = userEvaluations;
      stats = userStats;
    }
  } catch (error) {
    // Handle database connection errors gracefully
    console.log('Database connection error, showing landing page for non-authenticated users');
    isLoggedIn = false;
    userRole = null;
  }

  // Show evaluations overview for logged-in users
  if (isLoggedIn) {
    return (
      <AuthWrapper isLoggedIn={isLoggedIn}>
        <EvaluationsOverview 
          evaluations={evaluations} 
          stats={stats}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
        />
      </AuthWrapper>
    );
  }

  // Show marketing landing for non-authenticated users
  return (
    <AuthWrapper isLoggedIn={isLoggedIn}>
      <MarketingLanding 
        isLoggedIn={isLoggedIn} 
        userRole={userRole} 
      />
    </AuthWrapper>
  );
}
