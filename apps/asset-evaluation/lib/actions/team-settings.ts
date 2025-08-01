'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { getUser } from '@/lib/db/queries';
import { 
  teams, 
  teamMembers, 
  invitations, 
  users,
  ActivityType,
  activityLogs 
} from '@/lib/db/schema';

// Team invitation schema
const invitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer'], {
    errorMap: () => ({ message: 'Role must be admin, member, or viewer' })
  }),
});

// Update team member role schema
const updateMemberRoleSchema = z.object({
  memberId: z.number(),
  role: z.enum(['admin', 'member', 'viewer']),
});

export async function getTeamData() {
  try {
    const user = await getUser();
    if (!user) {
      return null;
    }

    // Get user's team with all members and pending invitations
    const result = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, user.id),
      with: {
        team: {
          with: {
            teamMembers: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!result?.team) {
      return null;
    }

    // Get pending invitations for this team
    const pendingInvitations = await db.query.invitations.findMany({
      where: and(
        eq(invitations.teamId, result.team.id),
        eq(invitations.status, 'pending')
      ),
      with: {
        invitedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Find current user's role in the team
    const currentUserMembership = result.team.teamMembers.find(
      member => member.userId === user.id
    );

    return {
      team: result.team,
      currentUserRole: currentUserMembership?.role || 'member',
      pendingInvitations,
    };
  } catch (error) {
    console.error('Error fetching team data:', error);
    return null;
  }
}

export async function inviteTeamMember(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/login');
    }

    // Get team data and verify user has permission to invite
    const teamData = await getTeamData();
    if (!teamData) {
      return { success: false, message: 'No team found' };
    }

    if (!['admin', 'owner'].some(role => teamData.currentUserRole?.includes(role))) {
      return { success: false, message: 'You do not have permission to invite members' };
    }

    // Extract and validate invitation data
    const invitationData = {
      email: (formData.get('email') as string).toLowerCase().trim(),
      role: formData.get('role') as string,
    };

    const validatedData = invitationSchema.parse(invitationData);

    // Check if user is already a team member
    const existingMember = teamData.team.teamMembers.find(
      member => member.user.email.toLowerCase() === validatedData.email
    );

    if (existingMember) {
      return { success: false, message: 'User is already a team member' };
    }

    // Check if invitation already exists
    const existingInvitation = teamData.pendingInvitations.find(
      inv => inv.email.toLowerCase() === validatedData.email
    );

    if (existingInvitation) {
      return { success: false, message: 'Invitation already sent to this email' };
    }

    // Create invitation
    await db.insert(invitations).values({
      teamId: teamData.team.id,
      email: validatedData.email,
      role: validatedData.role,
      invitedBy: user.id,
      status: 'pending',
    });

    // Log activity
    await db.insert(activityLogs).values({
      teamId: teamData.team.id,
      userId: user.id,
      action: `INVITE_TEAM_MEMBER: ${validatedData.email} as ${validatedData.role}`,
      ipAddress: null, // Could be enhanced to capture IP
    });

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Invitation sent successfully' };
  } catch (error) {
    console.error('Error inviting team member:', error);
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        message: 'Validation error', 
        errors: error.flatten().fieldErrors 
      };
    }
    return { success: false, message: 'Failed to send invitation' };
  }
}

export async function updateMemberRole(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/login');
    }

    const teamData = await getTeamData();
    if (!teamData) {
      return { success: false, message: 'No team found' };
    }

    if (!['admin', 'owner'].some(role => teamData.currentUserRole?.includes(role))) {
      return { success: false, message: 'You do not have permission to update member roles' };
    }

    const updateData = {
      memberId: parseInt(formData.get('memberId') as string),
      role: formData.get('role') as string,
    };

    const validatedData = updateMemberRoleSchema.parse(updateData);

    // Prevent user from changing their own role if they're the only admin
    const admins = teamData.team.teamMembers.filter(member => 
      member.role === 'admin' || member.role === 'owner'
    );
    
    const targetMember = teamData.team.teamMembers.find(member => 
      member.id === validatedData.memberId
    );

    if (targetMember?.userId === user.id && admins.length === 1) {
      return { success: false, message: 'Cannot change role - you are the only admin' };
    }

    // Update member role
    await db
      .update(teamMembers)
      .set({ 
        role: validatedData.role,
      })
      .where(eq(teamMembers.id, validatedData.memberId));

    // Log activity
    await db.insert(activityLogs).values({
      teamId: teamData.team.id,
      userId: user.id,
      action: `UPDATE_MEMBER_ROLE: ${targetMember?.user.email} to ${validatedData.role}`,
      ipAddress: null,
    });

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Member role updated successfully' };
  } catch (error) {
    console.error('Error updating member role:', error);
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        message: 'Validation error', 
        errors: error.flatten().fieldErrors 
      };
    }
    return { success: false, message: 'Failed to update member role' };
  }
}

export async function removeMember(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/login');
    }

    const teamData = await getTeamData();
    if (!teamData) {
      return { success: false, message: 'No team found' };
    }

    if (!['admin', 'owner'].some(role => teamData.currentUserRole?.includes(role))) {
      return { success: false, message: 'You do not have permission to remove members' };
    }

    const memberId = parseInt(formData.get('memberId') as string);
    const targetMember = teamData.team.teamMembers.find(member => member.id === memberId);

    if (!targetMember) {
      return { success: false, message: 'Member not found' };
    }

    // Prevent removing yourself if you're the only admin
    const admins = teamData.team.teamMembers.filter(member => 
      member.role === 'admin' || member.role === 'owner'
    );

    if (targetMember.userId === user.id && admins.length === 1) {
      return { success: false, message: 'Cannot remove yourself - you are the only admin' };
    }

    // Remove team member
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, memberId));

    // Log activity
    await db.insert(activityLogs).values({
      teamId: teamData.team.id,
      userId: user.id,
      action: `REMOVE_TEAM_MEMBER: ${targetMember.user.email}`,
      ipAddress: null,
    });

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Member removed successfully' };
  } catch (error) {
    console.error('Error removing member:', error);
    return { success: false, message: 'Failed to remove member' };
  }
}

export async function cancelInvitation(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/login');
    }

    const teamData = await getTeamData();
    if (!teamData) {
      return { success: false, message: 'No team found' };
    }

    if (!['admin', 'owner'].some(role => teamData.currentUserRole?.includes(role))) {
      return { success: false, message: 'You do not have permission to cancel invitations' };
    }

    const invitationId = parseInt(formData.get('invitationId') as string);

    // Remove invitation
    await db
      .delete(invitations)
      .where(eq(invitations.id, invitationId));

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Invitation cancelled successfully' };
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    return { success: false, message: 'Failed to cancel invitation' };
  }
}
