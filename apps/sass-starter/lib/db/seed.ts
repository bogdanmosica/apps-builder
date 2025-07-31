import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashPassword } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

async function seed() {
  const email = 'admin@admin.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  console.log('Creating super user...');

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let user;
  if (existingUser.length > 0) {
    user = existingUser[0];
    console.log('Super user already exists.');
  } else {
    // Create super user
    [user] = await db
      .insert(users)
      .values([
        {
          name: 'Super Admin',
          email: email,
          passwordHash: passwordHash,
          role: 'owner',
        },
      ])
      .returning();
    console.log('✅ Super user created successfully!');
  }

  // Check if user has a team
  const existingTeamMember = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, user.id))
    .limit(1);

  if (existingTeamMember.length === 0) {
    console.log('Creating default team for super user...');
    
    // Create a default team
    const [team] = await db
      .insert(teams)
      .values({
        name: 'Default Team',
      })
      .returning();

    // Add user to the team
    await db
      .insert(teamMembers)
      .values({
        userId: user.id,
        teamId: team.id,
        role: 'owner',
      });

    console.log(`✅ Default team created and user added as owner!`);
  } else {
    console.log('User already belongs to a team.');
  }

  console.log('');
  console.log('Super User Credentials:');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log('');
  console.log('You can now login and create products and other data through the interface.');
}

seed()
  .catch((error) => {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
