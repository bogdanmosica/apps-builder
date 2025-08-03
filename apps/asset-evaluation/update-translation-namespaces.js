const fs = require('fs');
const path = require('path');

// Define namespace mappings - what prefix maps to what namespace
const namespaceMappings = {
  'common.': 'common',
  'navigation.': 'navigation', 
  'property.': 'property',
  'evaluation.': 'evaluation',
  'dashboard.': 'dashboard',
  'propertyForm.': 'forms',
  'deleteConfirmation.': 'forms',
  'landing.': 'landing',
  'features.': 'features'
};

function updateTranslationKeys(filePath) {
  console.log(`\n🔧 Updating translation keys in: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // Replace translation keys
  for (const [prefix, namespace] of Object.entries(namespaceMappings)) {
    const pattern = new RegExp(`t\\((['"\`])${prefix.replace('.', '\\.')}([^'"\`]+)\\1\\)`, 'g');
    content = content.replace(pattern, (match, quote, key) => {
      changes++;
      return `t(${quote}${key}${quote}, { ns: '${namespace}' })`;
    });
  }
  
  if (changes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${changes} translation keys`);
  } else {
    console.log(`ℹ️  No translation keys found to update`);
  }
  
  return changes;
}

function updateUseTranslationHooks(filePath) {
  console.log(`\n🔧 Updating useTranslation hooks in: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find which namespaces are used in this file
  const usedNamespaces = new Set();
  
  for (const [prefix, namespace] of Object.entries(namespaceMappings)) {
    const hasPrefix = content.includes(`t('${prefix}`) || content.includes(`t("${prefix}`) || content.includes(`t(\`${prefix}`);
    if (hasPrefix) {
      usedNamespaces.add(namespace);
    }
  }
  
  if (usedNamespaces.size > 0) {
    const namespaceArray = Array.from(usedNamespaces).sort();
    const namespaceString = namespaceArray.length === 1 ? 
      `'${namespaceArray[0]}'` : 
      `[${namespaceArray.map(ns => `'${ns}'`).join(', ')}]`;
    
    // Replace useTranslation() with useTranslation([...namespaces])
    content = content.replace(
      /const\s+{\s*t\s*}\s*=\s*useTranslation\(\s*\);?/g,
      `const { t } = useTranslation(${namespaceString});`
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated useTranslation hook with namespaces: ${namespaceArray.join(', ')}`);
  }
}

// Get all TypeScript/TSX files in components
function getComponentFiles() {
  const componentsDir = path.join(__dirname, 'components');
  const files = [];
  
  function walkDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir);
  }
  
  return files;
}

// Run the updates
console.log('🚀 Starting translation namespace migration...');

const componentFiles = getComponentFiles();
console.log(`\n📁 Found ${componentFiles.length} component files`);

let totalChanges = 0;
for (const file of componentFiles) {
  updateUseTranslationHooks(file);
  totalChanges += updateTranslationKeys(file);
}

console.log(`\n🎉 Migration complete! Updated ${totalChanges} translation keys across ${componentFiles.length} files.`);
