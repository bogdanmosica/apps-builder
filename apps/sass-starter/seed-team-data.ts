import { db } from './lib/db/drizzle';
import { users, teams, teamMembers, invitations } from './lib/db/schema';
import { hashPassword } from './lib/auth/session';
import { eq } from 'drizzle-orm';

async function seedTeamData() {
  try {
    console.log('Starting team data seeding...');

    // Check if we already have a user
    const existingUsers = await db.select().from(users).limit(1);
    
    let user1, user2;
    
    if (existingUsers.length === 0) {
      // Create sample users
      const hashedPassword1 = await hashPassword('password123');
      const hashedPassword2 = await hashPassword('password123');

      [user1] = await db.insert(users).values({
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: hashedPassword1,
        role: 'member',
      }).returning();

      [user2] = await db.insert(users).values({
        name: 'Jane Smith',
        email: 'jane@example.com',
        passwordHash: hashedPassword2,
        role: 'member',
      }).returning();

      console.log('Created sample users');
    } else {
      // Use existing users
      const allUsers = await db.select().from(users).limit(2);
      user1 = allUsers[0];
      user2 = allUsers[1] || user1; // If only one user exists, use the same user twice
      console.log('Using existing users');
    }

    // Check if team already exists
    const existingTeam = await db.select().from(teams).limit(1);
    
    let team;
    if (existingTeam.length === 0) {
      // Create a sample team
      [team] = await db.insert(teams).values({
        name: 'Acme Corporation',
        planName: 'Pro',
        subscriptionStatus: 'active',
      }).returning();
      console.log('Created sample team');
    } else {
      team = existingTeam[0];
      console.log('Using existing team');
    }

    // Check if team members already exist
    const existingMembers = await db.select().from(teamMembers).where(eq(teamMembers.teamId, team.id));

    if (existingMembers.length === 0) {
      // Add users to team
      await db.insert(teamMembers).values([
        {
          userId: user1.id,
          teamId: team.id,
          role: 'owner',
        },
        ...(user2.id !== user1.id ? [{
          userId: user2.id,
          teamId: team.id,
          role: 'admin',
        }] : [])
      ]);
      console.log('Added team members');
    } else {
      console.log('Team members already exist');
    }

    // Add a sample pending invitation
    const existingInvitations = await db.select().from(invitations).where(eq(invitations.teamId, team.id));
    
    if (existingInvitations.length === 0) {
      await db.insert(invitations).values({
        teamId: team.id,
        email: 'newmember@example.com',
        role: 'member',
        invitedBy: user1.id,
        status: 'pending',
      });
      console.log('Added sample invitation');
    } else {
      console.log('Invitations already exist');
    }

    console.log('Team data seeding completed successfully!');
    console.log(`Team: ${team.name} (ID: ${team.id})`);
    console.log(`User 1: ${user1.name} (${user1.email})`);
    if (user2.id !== user1.id) {
      console.log(`User 2: ${user2.name} (${user2.email})`);
    }

  } catch (error) {
    console.error('Error seeding team data:', error);
  } finally {
    process.exit(0);
  }
}

seedTeamData();
