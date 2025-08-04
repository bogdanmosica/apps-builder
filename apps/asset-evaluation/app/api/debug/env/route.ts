export async function GET() {
  // Only allow this in development or if explicitly enabled
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_DEBUG_ROUTES) {
    return new Response('Not Found', { status: 404 });
  }

  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT_SET',
    AUTH_SECRET: process.env.AUTH_SECRET ? 'SET' : 'NOT_SET',
    BASE_URL: process.env.BASE_URL || 'NOT_SET',
    VERCEL_URL: process.env.VERCEL_URL || 'NOT_SET',
    timestamp: new Date().toISOString(),
  };

  return Response.json(envCheck);
}
