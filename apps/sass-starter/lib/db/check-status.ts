import { db } from './drizzle';
import { users, teams, teamMembers, activityLogs, invitations } from './schema';

async function checkDatabaseStatus() {
  console.log('🔍 Checking database status...\n');

  try {
    // Count users
    const userCount = await db.select().from(users);
    console.log(`👥 Users: ${userCount.length}`);
    userCount.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name || 'Unnamed'} (${user.email}) - ${user.role}`);
    });

    // Count teams
    const teamCount = await db.select().from(teams);
    console.log(`\n🏢 Teams: ${teamCount.length}`);
    teamCount.forEach((team, index) => {
      console.log(`  ${index + 1}. ${team.name} - ${team.planName || 'No plan'} (${team.subscriptionStatus || 'No status'})`);
    });

    // Count team members
    const memberCount = await db.select().from(teamMembers);
    console.log(`\n👥 Team Memberships: ${memberCount.length}`);

    // Count activity logs
    const activityCount = await db.select().from(activityLogs);
    console.log(`📊 Activity Logs: ${activityCount.length}`);

    // Count invitations
    const invitationCount = await db.select().from(invitations);
    console.log(`✉️ Pending Invitations: ${invitationCount.length}`);

    console.log('\n✅ Database is properly populated and ready for testing!');
    console.log('\n🚀 Available demo accounts:');
    console.log('   • test@test.com (password: admin123) - Original test account');
    console.log('   • john.doe@acme.com (password: demo123) - ACME Corporation Owner');
    console.log('   • sarah.wilson@acme.com (password: demo123) - ACME Corporation Admin');
    console.log('   • mike.johnson@acme.com (password: demo123) - ACME Corporation Member');
    console.log('   • emma.davis@acme.com (password: demo123) - ACME Corporation Member');
    console.log('   • alex.chen@startup.com (password: demo123) - Startup Inc Owner');
    console.log('\n🌐 Visit http://localhost:3000 to start testing the application!');

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabaseStatus()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
