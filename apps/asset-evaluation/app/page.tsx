import { getUser, getUserEvaluations, getUserEvaluationStats } from '@/lib/db/queries';
import ClientAuthPage from '@/components/client-auth-page';

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
      
      evaluations = userEvaluations || [];
      stats = userStats || {
        totalEvaluations: 0,
        averageScore: 0,
        bestScore: 0,
        completionRate: 0,
      };
    }
  } catch (error) {
    // Handle database connection errors gracefully
    console.error('Database connection error, showing landing page for non-authenticated users:', error);
    isLoggedIn = false;
    userRole = null;
    evaluations = [];
    stats = {
      totalEvaluations: 0,
      averageScore: 0,
      bestScore: 0,
      completionRate: 0,
    };
  }

  // Return the client-side authentication page that will handle showing the correct content
  return (
    <ClientAuthPage
      initialIsLoggedIn={isLoggedIn}
      initialUserRole={userRole}
      initialEvaluations={evaluations}
      initialStats={stats}
    />
  );
}
