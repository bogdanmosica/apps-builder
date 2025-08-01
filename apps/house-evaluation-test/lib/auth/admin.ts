import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function checkAdminAccess() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { authorized: false, error: 'Authentication required' };
    }

    // Get user details from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user.length) {
      return { authorized: false, error: 'User not found' };
    }

    // Check if user has admin role
    if (user[0].role !== 'admin') {
      return { authorized: false, error: 'Admin access required' };
    }

    return { authorized: true, user: user[0] };
  } catch (error) {
    console.error('Error checking admin access:', error);
    return { authorized: false, error: 'Internal server error' };
  }
}

export async function requireAdmin() {
  const access = await checkAdminAccess();
  if (!access.authorized) {
    throw new Error(access.error);
  }
  return access.user;
}
