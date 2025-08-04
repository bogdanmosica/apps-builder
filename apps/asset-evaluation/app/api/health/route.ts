import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // This will help test the app's behavior when database connections fail
    return NextResponse.json({
      message: 'Database connection test',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasDatabase: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      mockMode: !process.env.DATABASE_URL && !process.env.POSTGRES_URL
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check database status' },
      { status: 500 }
    );
  }
}
