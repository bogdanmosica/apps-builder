const fs = require('fs');
const path = require('path');

function fixTranslationStructure() {
  const enFile = path.join(__dirname, 'public/locales/en/translation.json');
  const roFile = path.join(__dirname, 'public/locales/ro/translation.json');
  
  console.log('🔧 Fixing translation file structure...');
  
  // Read the English file
  const enContent = fs.readFileSync(enFile, 'utf8');
  const enData = JSON.parse(enContent);
  
  // Read the Romanian file  
  const roContent = fs.readFileSync(roFile, 'utf8');
  const roData = JSON.parse(roContent);
  
  // Function to move sections to the correct location
  function fixStructure(data) {
    // Make sure landing object exists
    if (!data.landing) {
      data.landing = {};
    }
    
    // Move sections that should be under landing
    const sectionsToMove = ['offline', 'security', 'testimonials', 'faq', 'finalCta'];
    
    sectionsToMove.forEach(section => {
      if (data[section] && !data.landing[section]) {
        data.landing[section] = data[section];
        delete data[section]; // Remove from root level
      }
    });
    
    // Clean up any duplicate sections
    const keysToCheck = Object.keys(data);
    const duplicateKeys = [];
    
    keysToCheck.forEach(key => {
      if (keysToCheck.filter(k => k === key).length > 1) {
        duplicateKeys.push(key);
      }
    });
    
    console.log(`Found ${duplicateKeys.length} potential duplicate keys`);
    
    return data;
  }
  
  // Fix both structures
  const fixedEnData = fixStructure(enData);
  const fixedRoData = fixStructure(roData);
  
  // Write back to files
  fs.writeFileSync(enFile, JSON.stringify(fixedEnData, null, 2));
  fs.writeFileSync(roFile, JSON.stringify(fixedRoData, null, 2));
  
  console.log('✅ Translation files structure fixed!');
  console.log('📊 English keys:', countKeys(fixedEnData));
  console.log('📊 Romanian keys:', countKeys(fixedRoData));
}

function countKeys(obj, prefix = '') {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count += countKeys(obj[key], prefix ? `${prefix}.${key}` : key);
    } else {
      count++;
    }
  }
  return count;
}

// Run the fix
fixTranslationStructure();
