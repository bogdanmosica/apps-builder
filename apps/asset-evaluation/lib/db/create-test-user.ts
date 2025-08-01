import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashPassword } from '../auth/session';
import { eq } from 'drizzle-orm';

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, 'test@example.com'))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('✅ Test user already exists:', existingUser[0].email);
      return existingUser[0];
    }

    const testPassword = await hashPassword('testpassword123');
    
    const [user] = await db
      .insert(users)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: testPassword,
        role: 'owner',
      })
      .returning();

    console.log('✅ Test user created:', {
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Create a test team
    const [team] = await db
      .insert(teams)
      .values({
        name: 'Test Team',
        planName: 'starter',
        subscriptionStatus: 'active',
      })
      .returning();

    console.log('✅ Test team created:', team.name);

    // Add user to team
    await db.insert(teamMembers).values({
      userId: user.id,
      teamId: team.id,
      role: 'owner',
    });

    console.log('✅ User added to team');
    console.log('📧 Login with: test@example.com / testpassword123');

    return user;
  } catch (error: any) {
    console.error('❌ Error creating test user:', error);
    // If user already exists, just log that
    if (error.code === '23505') {
      console.log('⚠️  Test user already exists');
    }
    throw error;
  }
}

if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

export { createTestUser };
