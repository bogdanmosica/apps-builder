import { getUserEvaluations } from '@/lib/db/queries';

export async function GET() {
  try {
    const evaluations = await getUserEvaluations();
    return Response.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return new Response('Failed to fetch evaluations', { status: 500 });
  }
}
