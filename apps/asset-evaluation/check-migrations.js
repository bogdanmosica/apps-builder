const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

const sql = postgres('postgresql://postgres:Bogdana%231@localhost:5437/sass-starter');

async function checkMigrationStatus() {
  try {
    const result = await sql`SELECT * FROM drizzle.__drizzle_migrations ORDER BY id;`;
    console.log('Current migrations:');
    result.forEach(row => {
      console.log(`ID: ${row.id}, Hash: ${row.hash}, Created: ${new Date(row.created_at)}`);
    });
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

checkMigrationStatus();
