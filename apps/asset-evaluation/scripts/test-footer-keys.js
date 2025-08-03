/**
 * Test Footer Translation Keys
 * This script specifically tests the footer translation keys that were causing issues
 */

const fs = require('fs');
const path = require('path');

function testFooterKeys() {
  console.log('🧪 Testing Footer Translation Keys');
  console.log('='.repeat(40));

  const enLandingPath = path.join(__dirname, '..', 'public', 'locales', 'en', 'landing.json');
  const roLandingPath = path.join(__dirname, '..', 'public', 'locales', 'ro', 'landing.json');

  const enData = JSON.parse(fs.readFileSync(enLandingPath, 'utf8'));
  const roData = JSON.parse(fs.readFileSync(roLandingPath, 'utf8'));

  console.log('\n🔍 Testing specific footer keys:');
  
  // Test footer.brand.short (the corrected key)
  console.log('\n📋 footer.brand.short:');
  console.log(`   🇺🇸 EN: "${enData.footer?.brand?.short || 'NOT FOUND'}"`);
  console.log(`   🇷🇴 RO: "${roData.footer?.brand?.short || 'NOT FOUND'}"`);
  
  // Test footer.brand.long
  console.log('\n📋 footer.brand.long:');
  console.log(`   🇺🇸 EN: "${enData.footer?.brand?.long || 'NOT FOUND'}"`);
  console.log(`   🇷🇴 RO: "${roData.footer?.brand?.long || 'NOT FOUND'}"`);
  
  // Test footer.description
  console.log('\n📋 footer.description:');
  console.log(`   🇺🇸 EN: "${enData.footer?.description || 'NOT FOUND'}"`);
  console.log(`   🇷🇴 RO: "${roData.footer?.description || 'NOT FOUND'}"`);
  
  // Test collaboration.features.saveTime (the corrected keys)
  console.log('\n📋 collaboration.features.saveTime.title:');
  console.log(`   🇺🇸 EN: "${enData.collaboration?.features?.saveTime?.title || 'NOT FOUND'}"`);
  console.log(`   🇷🇴 RO: "${roData.collaboration?.features?.saveTime?.title || 'NOT FOUND'}"`);
  
  console.log('\n📋 collaboration.features.saveTime.description:');
  console.log(`   🇺🇸 EN: "${enData.collaboration?.features?.saveTime?.description || 'NOT FOUND'}"`);
  console.log(`   🇷🇴 RO: "${roData.collaboration?.features?.saveTime?.description || 'NOT FOUND'}"`);

  console.log('\n✅ Footer translation key test completed!');
  console.log('\n📝 Expected behavior:');
  console.log('   - Component should use footer.brand.short for brand name');
  console.log('   - Component should use collaboration.features.saveTime for the time-saving feature');
  console.log('   - No more "returned an object instead of string" errors');
}

testFooterKeys();
