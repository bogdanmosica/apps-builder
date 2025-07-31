import { db } from '@/lib/db/drizzle';
import { users, userSecuritySettings, userLoginSessions, securityEvents } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  
  return user;
}

export async function getSecurityData() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return null;
    }

    // Get user info
    const user = await db.query.users.findFirst({
      where: eq(users.id, currentUser.id),
      columns: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return null;
    }

    // Get security settings
    let securitySettings = await db.query.userSecuritySettings.findFirst({
      where: eq(userSecuritySettings.userId, user.id),
    });

    // Create default security settings if they don't exist
    if (!securitySettings) {
      const [newSettings] = await db.insert(userSecuritySettings).values({
        userId: user.id,
        twoFactorEnabled: false,
        loginNotifications: true,
        securityAlerts: true,
        sessionTimeout: 24, // 24 hours default
        lastPasswordChange: new Date(),
      }).returning();
      
      securitySettings = newSettings;
    }

    // Get active sessions
    const activeSessions = await db.query.userLoginSessions.findMany({
      where: and(
        eq(userLoginSessions.userId, user.id),
        eq(userLoginSessions.isActive, true)
      ),
      orderBy: [desc(userLoginSessions.lastActivity)],
      limit: 10,
    });

    // Get recent security events
    const recentEvents = await db.query.securityEvents.findMany({
      where: eq(securityEvents.userId, user.id),
      orderBy: [desc(securityEvents.timestamp)],
      limit: 20,
    });

    return {
      user,
      securitySettings: {
        twoFactorEnabled: securitySettings.twoFactorEnabled,
        loginNotifications: securitySettings.loginNotifications,
        securityAlerts: securitySettings.securityAlerts,
        sessionTimeout: securitySettings.sessionTimeout,
        lastPasswordChange: securitySettings.lastPasswordChange,
      },
      activeSessions: activeSessions.map((session: any) => ({
        id: session.id,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        location: session.location,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
        isActive: session.isActive,
      })),
      recentEvents: recentEvents.map((event: any) => ({
        id: event.id,
        eventType: event.eventType,
        eventDetails: event.eventDetails,
        ipAddress: event.ipAddress,
        location: event.location,
        riskLevel: event.riskLevel,
        timestamp: event.timestamp,
      })),
    };
  } catch (error) {
    console.error('Error fetching security data:', error);
    return null;
  }
}
