const fs = require('fs');
const path = require('path');

/**
 * Runtime Translation Test
 * This script simulates how translations would be loaded at runtime
 */

function loadNamespaceFile(lang, namespace) {
  const filePath = path.join(__dirname, '..', 'public', 'locales', lang, `${namespace}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Translation file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function testTranslation(lang, namespace, key) {
  try {
    const translations = loadNamespaceFile(lang, namespace);
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return `❌ Key "${key}" not found in ${lang}/${namespace}`;
      }
    }
    
    if (typeof value === 'string' && value.trim() !== '') {
      return `✅ ${lang}/${namespace}.${key}: "${value}"`;
    } else {
      return `⚠️ ${lang}/${namespace}.${key}: Empty or invalid value`;
    }
  } catch (error) {
    return `❌ Error loading ${lang}/${namespace}: ${error.message}`;
  }
}

console.log('🧪 Runtime Translation Test');
console.log('=' .repeat(50));

// Test some sample keys from different namespaces
const testCases = [
  ['common', 'yes'],
  ['common', 'no'], 
  ['common', 'loading'],
  ['navigation', 'dashboard'],
  ['navigation', 'properties'],
  ['property', 'title'],
  ['property', 'description'],
  ['evaluation', 'start'],
  ['evaluation', 'complete'],
  ['forms', 'save'],
  ['landing', 'title'],
  ['landing', 'subtitle']
];

console.log('\n📋 Testing key availability in both languages:');
testCases.forEach(([namespace, key]) => {
  console.log('\n' + '-'.repeat(40));
  console.log(`Testing: ${namespace}.${key}`);
  console.log(testTranslation('en', namespace, key));
  console.log(testTranslation('ro', namespace, key));
});

// Test namespace loading
console.log('\n\n📚 Namespace Loading Test:');
console.log('=' .repeat(50));

const namespaces = ['common', 'navigation', 'property', 'evaluation', 'dashboard', 'forms', 'landing', 'features'];
const languages = ['en', 'ro'];

let totalKeys = { en: 0, ro: 0 };
let successfulLoads = 0;
let totalAttempts = 0;

languages.forEach(lang => {
  console.log(`\n🌍 ${lang.toUpperCase()} Language:`);
  namespaces.forEach(namespace => {
    totalAttempts++;
    try {
      const data = loadNamespaceFile(lang, namespace);
      const keyCount = Object.keys(data).length;
      totalKeys[lang] += keyCount;
      successfulLoads++;
      console.log(`  ✅ ${namespace}: ${keyCount} keys loaded`);
    } catch (error) {
      console.log(`  ❌ ${namespace}: Failed to load - ${error.message}`);
    }
  });
});

console.log('\n📊 Summary:');
console.log(`  Successful loads: ${successfulLoads}/${totalAttempts}`);
console.log(`  English total keys: ${totalKeys.en}`);  
console.log(`  Romanian total keys: ${totalKeys.ro}`);
console.log(`  Key parity: ${totalKeys.en === totalKeys.ro ? '✅ Perfect match' : '❌ Mismatch'}`);

if (successfulLoads === totalAttempts && totalKeys.en === totalKeys.ro && totalKeys.en > 0) {
  console.log('\n🎉 All tests passed! Translation system is working correctly.');
} else {
  console.log('\n⚠️ Some issues detected. Please check the output above.');
}
