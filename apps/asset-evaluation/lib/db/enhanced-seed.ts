import { hashPassword } from "@/lib/auth/session";
import { stripe } from "../payments/stripe";
import { db } from "./drizzle";
import { activityLogs, invitations, teamMembers, teams, users } from "./schema";

async function createEnhancedSampleData() {
  console.log("Creating enhanced sample data for enterprise features...");

  const password = "demo123";
  const passwordHash = await hashPassword(password);

  // Create additional users
  const demoUsers = await db
    .insert(users)
    .values([
      {
        email: "john.doe@acme.com",
        passwordHash: passwordHash,
        name: "John Doe",
        role: "owner",
      },
      {
        email: "sarah.wilson@acme.com",
        passwordHash: passwordHash,
        name: "Sarah Wilson",
        role: "admin",
      },
      {
        email: "mike.johnson@acme.com",
        passwordHash: passwordHash,
        name: "Mike Johnson",
        role: "member",
      },
      {
        email: "emma.davis@acme.com",
        passwordHash: passwordHash,
        name: "Emma Davis",
        role: "member",
      },
      {
        email: "alex.chen@startup.com",
        passwordHash: passwordHash,
        name: "Alex Chen",
        role: "owner",
      },
    ])
    .returning();

  console.log("Additional users created.");

  // Create additional teams
  const additionalTeams = await db
    .insert(teams)
    .values([
      {
        name: "ACME Corporation",
        planName: "Enterprise",
        subscriptionStatus: "active",
      },
      {
        name: "Startup Inc",
        planName: "Pro",
        subscriptionStatus: "active",
      },
      {
        name: "Marketing Agency",
        planName: "Plus",
        subscriptionStatus: "trialing",
      },
    ])
    .returning();

  console.log("Additional teams created.");

  // Create team memberships
  const teamMemberships = [
    // ACME Corporation team
    { teamId: additionalTeams[0].id, userId: demoUsers[0].id, role: "owner" },
    { teamId: additionalTeams[0].id, userId: demoUsers[1].id, role: "admin" },
    { teamId: additionalTeams[0].id, userId: demoUsers[2].id, role: "member" },
    { teamId: additionalTeams[0].id, userId: demoUsers[3].id, role: "member" },

    // Startup Inc team
    { teamId: additionalTeams[1].id, userId: demoUsers[4].id, role: "owner" },
  ];

  await db.insert(teamMembers).values(teamMemberships);
  console.log("Team memberships created.");

  // Create sample activity logs
  const activities = [
    {
      teamId: additionalTeams[0].id,
      userId: demoUsers[0].id,
      action: "SIGN_IN",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      ipAddress: "192.168.1.100",
    },
    {
      teamId: additionalTeams[0].id,
      userId: demoUsers[1].id,
      action: "UPDATE_ACCOUNT",
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      ipAddress: "192.168.1.101",
    },
    {
      teamId: additionalTeams[0].id,
      userId: demoUsers[0].id,
      action: "INVITE_TEAM_MEMBER",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      ipAddress: "192.168.1.100",
    },
    {
      teamId: additionalTeams[1].id,
      userId: demoUsers[4].id,
      action: "CREATE_TEAM",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      ipAddress: "10.0.0.50",
    },
    {
      teamId: additionalTeams[0].id,
      userId: demoUsers[2].id,
      action: "ACCEPT_INVITATION",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      ipAddress: "192.168.1.102",
    },
  ];

  await db.insert(activityLogs).values(activities);
  console.log("Sample activity logs created.");

  // Create sample invitations
  const sampleInvitations = [
    {
      teamId: additionalTeams[0].id,
      email: "pending.user@acme.com",
      role: "member",
      invitedBy: demoUsers[0].id,
      status: "pending",
    },
    {
      teamId: additionalTeams[1].id,
      email: "new.hire@startup.com",
      role: "admin",
      invitedBy: demoUsers[4].id,
      status: "pending",
    },
  ];

  await db.insert(invitations).values(sampleInvitations);
  console.log("Sample invitations created.");

  console.log("Enhanced sample data creation completed!");
  console.log("");
  console.log("Demo accounts created:");
  console.log("- john.doe@acme.com (Owner at ACME Corporation)");
  console.log("- sarah.wilson@acme.com (Admin at ACME Corporation)");
  console.log("- mike.johnson@acme.com (Member at ACME Corporation)");
  console.log("- emma.davis@acme.com (Member at ACME Corporation)");
  console.log("- alex.chen@startup.com (Owner at Startup Inc)");
  console.log("- Password for all accounts: demo123");
  console.log("");
}

async function main() {
  try {
    await createEnhancedSampleData();
  } catch (error) {
    console.error("Enhanced seeding failed:", error);
    process.exit(1);
  } finally {
    console.log("Enhanced seeding process finished. Exiting...");
    process.exit(0);
  }
}

main();
