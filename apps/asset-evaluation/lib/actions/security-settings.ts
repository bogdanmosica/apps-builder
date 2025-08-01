'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { getUser } from '@/lib/db/queries';
import { 
  users,
  userSecuritySettings,
  userLoginSessions,
  securityEvents,
  activityLogs
} from '@/lib/db/schema';
import { hashPassword, comparePasswords } from '@/lib/auth/session';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';

// Password change schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/^(?=.*\d)/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New password and confirmation password don't match",
  path: ["confirmPassword"],
});

// Security settings schema
const securitySettingsSchema = z.object({
  loginNotifications: z.boolean(),
  securityAlerts: z.boolean(),
  sessionTimeout: z.number().min(1).max(168), // 1 hour to 1 week
});

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-change-this';

function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

function decryptData(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export async function getSecurityData() {
  try {
    const user = await getUser();
    if (!user) {
      return null;
    }

    // Get security settings
    const securitySettings = await db.query.userSecuritySettings.findFirst({
      where: eq(userSecuritySettings.userId, user.id),
    });

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
      limit: 10,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      securitySettings: securitySettings || {
        twoFactorEnabled: false,
        loginNotifications: true,
        securityAlerts: true,
        sessionTimeout: 24,
        lastPasswordChange: user.updatedAt,
      },
      activeSessions,
      recentEvents,
    };
  } catch (error) {
    console.error('Error fetching security data:', error);
    return null;
  }
}

export async function changePassword(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/login');
    }

    const passwordData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    // Validate input data
    let validatedData;
    try {
      validatedData = passwordChangeSchema.parse(passwordData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        return { 
          success: false, 
          message: firstError.message 
        };
      }
      return { success: false, message: 'Invalid input data' };
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePasswords(
      validatedData.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return { success: false, message: 'Current password is incorrect' };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(validatedData.newPassword);

    // Update user password
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Update security settings with password change timestamp
    await db
      .insert(userSecuritySettings)
      .values({
        userId: user.id,
        lastPasswordChange: new Date(),
      })
      .onConflictDoUpdate({
        target: userSecuritySettings.userId,
        set: {
          lastPasswordChange: new Date(),
          updatedAt: new Date(),
        },
      });

    // Log security event
    await db.insert(securityEvents).values({
      userId: user.id,
      eventType: 'password_change',
      eventDetails: { source: 'settings' },
      riskLevel: 'low',
    });

    // Log activity
    await db.insert(activityLogs).values({
      teamId: 1, // Default team - you might want to get actual team
      userId: user.id,
      action: 'UPDATE_PASSWORD',
    });

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Password changed successfully' };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, message: 'Failed to change password' };
  }
}

export async function enable2FA() {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/login');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${process.env.NEXT_PUBLIC_APP_NAME || 'SaaS App'} (${user.email})`,
      issuer: process.env.NEXT_PUBLIC_APP_NAME || 'SaaS App',
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // Store encrypted secret temporarily (user needs to verify before enabling)
    const encryptedSecret = encryptData(secret.base32);

    return {
      success: true,
      secret: secret.base32,
      qrCode,
      manualEntryKey: secret.base32,
    };
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return { success: false, message: 'Failed to setup 2FA' };
  }
}

export async function verify2FA(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/login');
    }

    const secret = formData.get('secret') as string;
    const token = formData.get('token') as string;

    if (!secret || !token) {
      return { success: false, message: 'Secret and token are required' };
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1, // Allow 1 step before/after for clock skew
    });

    if (!verified) {
      return { success: false, message: 'Invalid verification code' };
    }

    // Generate recovery codes
    const recoveryCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    const recoveryCodesHash = await hashPassword(recoveryCodes.join(','));
    const encryptedSecret = encryptData(secret);

    // Save 2FA settings
    await db
      .insert(userSecuritySettings)
      .values({
        userId: user.id,
        twoFactorEnabled: true,
        twoFactorSecret: encryptedSecret,
        recoveryCodesHash,
      })
      .onConflictDoUpdate({
        target: userSecuritySettings.userId,
        set: {
          twoFactorEnabled: true,
          twoFactorSecret: encryptedSecret,
          recoveryCodesHash,
          updatedAt: new Date(),
        },
      });

    // Log security event
    await db.insert(securityEvents).values({
      userId: user.id,
      eventType: '2fa_enabled',
      eventDetails: { method: 'totp' },
      riskLevel: 'low',
    });

    revalidatePath('/dashboard/settings');
    return { 
      success: true, 
      message: '2FA enabled successfully',
      recoveryCodes 
    };
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return { success: false, message: 'Failed to verify 2FA' };
  }
}

export async function disable2FA(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/login');
    }

    const password = formData.get('password') as string;

    if (!password) {
      return { success: false, message: 'Password is required to disable 2FA' };
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, message: 'Incorrect password' };
    }

    // Disable 2FA
    await db
      .update(userSecuritySettings)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        recoveryCodesHash: null,
        updatedAt: new Date(),
      })
      .where(eq(userSecuritySettings.userId, user.id));

    // Log security event
    await db.insert(securityEvents).values({
      userId: user.id,
      eventType: '2fa_disabled',
      eventDetails: { method: 'password' },
      riskLevel: 'medium',
    });

    revalidatePath('/dashboard/settings');
    return { success: true, message: '2FA disabled successfully' };
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return { success: false, message: 'Failed to disable 2FA' };
  }
}

export async function updateSecuritySettings(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/login');
    }

    const settingsData = {
      loginNotifications: formData.get('loginNotifications') === 'true',
      securityAlerts: formData.get('securityAlerts') === 'true',
      sessionTimeout: parseInt(formData.get('sessionTimeout') as string),
    };

    // Validate input data
    let validatedData;
    try {
      validatedData = securitySettingsSchema.parse(settingsData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        return { 
          success: false, 
          message: firstError.message 
        };
      }
      return { success: false, message: 'Invalid input data' };
    }

    // Update security settings
    await db
      .insert(userSecuritySettings)
      .values({
        userId: user.id,
        ...validatedData,
      })
      .onConflictDoUpdate({
        target: userSecuritySettings.userId,
        set: {
          ...validatedData,
          updatedAt: new Date(),
        },
      });

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Security settings updated successfully' };
  } catch (error) {
    console.error('Error updating security settings:', error);
    return { success: false, message: 'Failed to update security settings' };
  }
}

export async function revokeSession(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/login');
    }

    const sessionId = parseInt(formData.get('sessionId') as string);

    // Revoke session
    await db
      .update(userLoginSessions)
      .set({
        isActive: false,
      })
      .where(and(
        eq(userLoginSessions.id, sessionId),
        eq(userLoginSessions.userId, user.id)
      ));

    // Log security event
    await db.insert(securityEvents).values({
      userId: user.id,
      eventType: 'session_revoked',
      eventDetails: { sessionId, method: 'manual' },
      riskLevel: 'low',
    });

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Session revoked successfully' };
  } catch (error) {
    console.error('Error revoking session:', error);
    return { success: false, message: 'Failed to revoke session' };
  }
}

export async function revokeAllSessions() {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/login');
    }

    // Revoke all sessions except current one (simplified - in real app you'd exclude current session)
    await db
      .update(userLoginSessions)
      .set({
        isActive: false,
      })
      .where(eq(userLoginSessions.userId, user.id));

    // Log security event
    await db.insert(securityEvents).values({
      userId: user.id,
      eventType: 'all_sessions_revoked',
      eventDetails: { method: 'manual' },
      riskLevel: 'medium',
    });

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'All sessions revoked successfully' };
  } catch (error) {
    console.error('Error revoking all sessions:', error);
    return { success: false, message: 'Failed to revoke all sessions' };
  }
}
