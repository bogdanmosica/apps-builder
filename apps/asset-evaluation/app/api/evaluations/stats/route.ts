import { getUserEvaluationStats } from '@/lib/db/queries';

export async function GET() {
  try {
    const stats = await getUserEvaluationStats();
    return Response.json(stats);
  } catch (error) {
    console.error('Error fetching evaluation stats:', error);
    return new Response('Failed to fetch evaluation stats', { status: 500 });
  }
}
