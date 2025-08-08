import { db } from "../lib/db/drizzle";
import { users } from "../lib/db/schema";

async function checkUserRoles() {
  try {
    console.log("Checking all users and their roles...\n");

    const allUsers = await db.select().from(users);

    if (allUsers.length === 0) {
      console.log("No users found in database.");
      return;
    }

    console.log("Users in database:");
    console.log("==================");

    allUsers.forEach((user: any, index: number) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log("---");
    });

    console.log("\nRole Summary:");
    const roleCounts = allUsers.reduce(
      (acc: Record<string, number>, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`${role}: ${count} user(s)`);
    });
  } catch (error) {
    console.error("Error checking user roles:", error);
  } finally {
    process.exit(0);
  }
}

checkUserRoles();
