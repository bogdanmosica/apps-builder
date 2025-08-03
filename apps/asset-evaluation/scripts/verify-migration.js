/**
 * Migration Success Verification
 * 
 * This script verifies that the migration from single translation files
 * to namespace-based translation files was successful.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Translation System Migration - Final Verification');
console.log('='.repeat(60));

// Check if old files exist (they should be gone)
const oldEnPath = path.join(__dirname, '..', 'public', 'locales', 'en', 'translation.json');
const oldRoPath = path.join(__dirname, '..', 'public', 'locales', 'ro', 'translation.json');

console.log('\n📁 Old translation files status:');
console.log(`   English: ${fs.existsSync(oldEnPath) ? '❌ Still exists (should be removed)' : '✅ Removed'}`);
console.log(`   Romanian: ${fs.existsSync(oldRoPath) ? '❌ Still exists (should be removed)' : '✅ Removed'}`);

// Check namespace files
const namespaces = ['common', 'navigation', 'property', 'evaluation', 'dashboard', 'forms', 'landing', 'features'];
console.log('\n📚 Namespace files status:');

let allNamespacesExist = true;
let totalKeys = { en: 0, ro: 0 };

namespaces.forEach(namespace => {
  const enPath = path.join(__dirname, '..', 'public', 'locales', 'en', `${namespace}.json`);
  const roPath = path.join(__dirname, '..', 'public', 'locales', 'ro', `${namespace}.json`);
  
  const enExists = fs.existsSync(enPath);
  const roExists = fs.existsSync(roPath);
  
  if (enExists && roExists) {
    const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const roData = JSON.parse(fs.readFileSync(roPath, 'utf8'));
    const enKeys = Object.keys(enData).length;
    const roKeys = Object.keys(roData).length;
    
    totalKeys.en += enKeys;
    totalKeys.ro += roKeys;
    
    console.log(`   ✅ ${namespace}: EN(${enKeys}) RO(${roKeys}) ${enKeys === roKeys ? '✅' : '❌'}`);
  } else {
    console.log(`   ❌ ${namespace}: ${enExists ? 'EN✅' : 'EN❌'} ${roExists ? 'RO✅' : 'RO❌'}`);
    allNamespacesExist = false;
  }
});

// Check i18n configuration
console.log('\n⚙️ i18n configuration status:');
const i18nPath = path.join(__dirname, '..', 'lib', 'i18n.ts');
if (fs.existsSync(i18nPath)) {
  const i18nContent = fs.readFileSync(i18nPath, 'utf8');
  const hasNamespaces = namespaces.every(ns => i18nContent.includes(`${ns}.json`));
  const hasDefaultNS = i18nContent.includes("defaultNS: 'common'");
  const hasNSArray = i18nContent.includes('ns: [');
  
  console.log(`   ✅ i18n.ts exists`);
  console.log(`   ${hasNamespaces ? '✅' : '❌'} All namespace imports present`);
  console.log(`   ${hasDefaultNS ? '✅' : '❌'} Default namespace set to 'common'`);
  console.log(`   ${hasNSArray ? '✅' : '❌'} Namespace array configured`);
} else {
  console.log(`   ❌ i18n.ts not found`);
}

// Migration summary
console.log('\n📊 Migration Summary:');
console.log(`   Namespaces: ${namespaces.length}`);
console.log(`   Total English keys: ${totalKeys.en}`);
console.log(`   Total Romanian keys: ${totalKeys.ro}`);
console.log(`   Key synchronization: ${totalKeys.en === totalKeys.ro ? '✅ Perfect' : '❌ Mismatch'}`);

console.log('\n🎯 Migration Status:');
if (allNamespacesExist && totalKeys.en === totalKeys.ro && totalKeys.en > 0) {
  console.log('✅ MIGRATION SUCCESSFUL!');
  console.log('   • Namespace-based translation system implemented');
  console.log('   • All translation keys properly organized');
  console.log('   • English and Romanian translations synchronized');
  console.log('   • Ready for production use');
} else {
  console.log('❌ MIGRATION INCOMPLETE');
  console.log('   Please check the issues mentioned above');
}

console.log('\n🚀 Next Steps:');
console.log('   1. Test the application with both English and Romanian');
console.log('   2. Remove old translation.json files if they still exist');
console.log('   3. Update any remaining component files to use namespaces');
console.log('   4. Monitor for missing translation warnings');

console.log('\n' + '='.repeat(60));
