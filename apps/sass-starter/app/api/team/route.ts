import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { 
  teamMembers, 
  teams, 
  users, 
  invitations,
  userSessions 
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc, gte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('Team API: Starting request');
    
    const user = await getUser();
    if (!user) {
      console.log('Team API: No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Team API: User found:', user.id, user.email);

    // Get user's team membership
    const userTeamMember = await db
      .select({ teamId: teamMembers.teamId, role: teamMembers.role })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    console.log('Team API: User team members:', userTeamMember.length);

    if (userTeamMember.length === 0) {
      console.log('Team API: No team found for user');
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const teamId = userTeamMember[0].teamId;
    console.log('Team API: Team ID:', teamId);

    // Get team information
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (team.length === 0) {
      console.log('Team API: Team not found in teams table');
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    console.log('Team API: Team found:', team[0].name);

    // Get all team members with user details
    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        createdAt: users.createdAt,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId))
      .orderBy(teamMembers.joinedAt);

    console.log('Team API: Members found:', members.length);

    // Simple version - just set last active to "Recently" for now
    const formattedMembers = members.map(member => ({
      id: member.id,
      name: member.name || member.email.split('@')[0],
      email: member.email,
      role: member.role,
      status: 'Active',
      lastActive: 'Recently',
      joinedAt: member.joinedAt.toISOString().split('T')[0],
      avatar: null,
    }));

    // Get pending invitations (simplified)
    let formattedInvitations: any[] = [];
    try {
      const pendingInvites = await db
        .select({
          id: invitations.id,
          email: invitations.email,
          role: invitations.role,
          invitedAt: invitations.invitedAt,
          status: invitations.status,
          invitedByName: users.name,
          invitedByEmail: users.email,
        })
        .from(invitations)
        .innerJoin(users, eq(invitations.invitedBy, users.id))
        .where(
          and(
            eq(invitations.teamId, teamId), 
            eq(invitations.status, 'pending')
          )
        )
        .orderBy(desc(invitations.invitedAt));

      console.log('Team API: Invitations found:', pendingInvites.length);

      formattedInvitations = pendingInvites.map(invite => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        invitedBy: invite.invitedByName || invite.invitedByEmail,
        invitedAt: invite.invitedAt.toISOString().split('T')[0],
        expiresAt: new Date(invite.invitedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0],
        status: invite.status,
      }));
    } catch (inviteError) {
      console.error('Team API: Error fetching invitations:', inviteError);
      // Continue without invitations if there's an error
    }

    // Calculate stats
    const stats = {
      totalMembers: formattedMembers.length,
      activeMembers: formattedMembers.filter(m => m.status === 'Active').length,
      pendingInvites: formattedInvitations.length,
    };

    console.log('Team API: Stats:', stats);

    return NextResponse.json({
      team: team[0],
      members: formattedMembers,
      invitations: formattedInvitations,
      stats,
      currentUserRole: userTeamMember[0].role,
    });
  } catch (error) {
    console.error('Team API: Error fetching team data:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
