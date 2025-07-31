import { 
  getContentPosts, 
  getContentCategories, 
  getContentMedia, 
  getContentStats,
  getRecentContentActivity
} from '@/lib/db/content-queries';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export async function getContentData() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // For now, we'll use teamId = 1 as a default
  // In a real app, you'd get this from the user's team membership
  const teamId = 1;

  try {
    const [posts, categories, media, stats, recentActivity] = await Promise.all([
      getContentPosts(teamId),
      getContentCategories(teamId),
      getContentMedia(teamId, { limit: 20 }),
      getContentStats(teamId),
      getRecentContentActivity(teamId, 5)
    ]);

    return {
      posts,
      categories,
      media,
      stats,
      recentActivity,
    };
  } catch (error) {
    console.error('Error fetching content data:', error);
    return {
      posts: [],
      categories: [],
      media: [],
      stats: {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalViews: 0,
        totalComments: 0,
        totalCategories: 0,
      },
      recentActivity: [],
    };
  }
}
