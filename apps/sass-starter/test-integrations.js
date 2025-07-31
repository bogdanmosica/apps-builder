// Quick test script to seed integrations data if needed
// Run this with: node test-integrations.js

const fetch = require('node-fetch');

async function testAndSeedIntegrations() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    console.log('Testing integrations API...');
    
    // First, try to get existing data
    const getResponse = await fetch(`${baseUrl}/api/integrations`, {
      credentials: 'include',
    });
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ Integrations API working');
      console.log(`Found ${data.activeIntegrations?.length || 0} active integrations`);
      
      if (data.activeIntegrations?.length === 0) {
        console.log('No integrations found, seeding sample data...');
        
        const seedResponse = await fetch(`${baseUrl}/api/integrations/seed`, {
          method: 'POST',
          credentials: 'include',
        });
        
        if (seedResponse.ok) {
          const seedData = await seedResponse.json();
          console.log('✅ Sample data seeded successfully');
          console.log(seedData);
        } else {
          console.log('❌ Failed to seed data:', seedResponse.status);
        }
      }
    } else {
      console.log('❌ Integrations API failed:', getResponse.status);
      if (getResponse.status === 401) {
        console.log('Note: You may need to be logged in to access this endpoint');
      }
    }
  } catch (error) {
    console.error('Error testing integrations:', error.message);
  }
}

testAndSeedIntegrations();
