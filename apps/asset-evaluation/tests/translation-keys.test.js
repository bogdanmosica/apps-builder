const fs = require('fs');
const path = require('path');

/**
 * Translation Keys Structure Test
 * 
 * This test ensures that all translation namespace files have identical key structures.
 * It's crucial for i18n consistency - every key in English must exist in Romanian and vice versa.
 */

describe('Translation Namespace Files Structure', () => {
  const localesPath = path.join(__dirname, '../public/locales');
  const namespaces = ['common', 'navigation', 'property', 'evaluation', 'dashboard', 'forms', 'landing', 'features'];

  /**
   * Recursively extracts all keys from a nested object
   * @param {Object} obj - The object to extract keys from
   * @param {string} prefix - Current key path prefix
   * @returns {Array<string>} - Array of all nested keys in dot notation
   */
  function getAllKeys(obj, prefix = '') {
    let keys = [];
    
    for (let key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Recursively get keys from nested objects
        keys = keys.concat(getAllKeys(obj[key], fullKey));
      } else {
        // This is a leaf node (actual translation value)
        keys.push(fullKey);
      }
    }
    
    return keys;
  }

  /**
   * Loads and parses a translation JSON file
   * @param {string} filePath - Path to the translation file
   * @returns {Object} - Parsed JSON object
   */
  function loadTranslationFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load translation file ${filePath}: ${error.message}`);
    }
  }

  let allNamespaces = {};
  let totalEnglishKeys = 0;
  let totalRomanianKeys = 0;

  beforeAll(() => {
    // Load all namespace files
    namespaces.forEach(namespace => {
      const englishPath = path.join(localesPath, `en/${namespace}.json`);
      const romanianPath = path.join(localesPath, `ro/${namespace}.json`);
      
      const englishTranslations = loadTranslationFile(englishPath);
      const romanianTranslations = loadTranslationFile(romanianPath);
      
      const englishKeys = getAllKeys(englishTranslations).sort();
      const romanianKeys = getAllKeys(romanianTranslations).sort();
      
      allNamespaces[namespace] = {
        englishTranslations,
        romanianTranslations,
        englishKeys,
        romanianKeys
      };
      
      totalEnglishKeys += englishKeys.length;
      totalRomanianKeys += romanianKeys.length;
    });
  });

  test('all namespace files should exist', () => {
    namespaces.forEach(namespace => {
      const englishPath = path.join(localesPath, `en/${namespace}.json`);
      const romanianPath = path.join(localesPath, `ro/${namespace}.json`);
      
      expect(fs.existsSync(englishPath)).toBe(true);
      expect(fs.existsSync(romanianPath)).toBe(true);
    });
  });

  test('all namespace files should be valid JSON', () => {
    namespaces.forEach(namespace => {
      const data = allNamespaces[namespace];
      expect(data.englishTranslations).toBeDefined();
      expect(data.romanianTranslations).toBeDefined();
      expect(typeof data.englishTranslations).toBe('object');
      expect(typeof data.romanianTranslations).toBe('object');
    });
  });

  namespaces.forEach(namespace => {
    describe(`${namespace} namespace`, () => {
      test('should have the same number of keys in both languages', () => {
        const data = allNamespaces[namespace];
        expect(data.romanianKeys).toHaveLength(data.englishKeys.length);
      });

      test('Romanian should have all English keys', () => {
        const data = allNamespaces[namespace];
        const missingKeys = data.englishKeys.filter(key => !data.romanianKeys.includes(key));
        
        if (missingKeys.length > 0) {
          console.log(`❌ Missing keys in Romanian ${namespace}:`);
          missingKeys.forEach(key => console.log(`   - ${key}`));
        }
        
        expect(missingKeys).toHaveLength(0);
      });

      test('Romanian should not have extra keys', () => {
        const data = allNamespaces[namespace];
        const extraKeys = data.romanianKeys.filter(key => !data.englishKeys.includes(key));
        
        if (extraKeys.length > 0) {
          console.log(`❌ Extra keys in Romanian ${namespace}:`);
          extraKeys.forEach(key => console.log(`   + ${key}`));
        }
        
        expect(extraKeys).toHaveLength(0);
      });

      test('key structures should be identical', () => {
        const data = allNamespaces[namespace];
        expect(JSON.stringify(data.romanianKeys)).toBe(JSON.stringify(data.englishKeys));
      });

      test('should not have empty translation values', () => {
        function checkEmptyValues(obj, prefix = '') {
          const emptyKeys = [];
          
          for (let key in obj) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
              emptyKeys.push(...checkEmptyValues(obj[key], fullKey));
            } else if (typeof obj[key] === 'string' && obj[key].trim() === '') {
              emptyKeys.push(fullKey);
            }
          }
          
          return emptyKeys;
        }

        const data = allNamespaces[namespace];
        const emptyEnglishKeys = checkEmptyValues(data.englishTranslations);
        const emptyRomanianKeys = checkEmptyValues(data.romanianTranslations);

        if (emptyEnglishKeys.length > 0) {
          console.log(`❌ Empty English translations in ${namespace}:`);
          emptyEnglishKeys.forEach(key => console.log(`   - ${key}`));
        }

        if (emptyRomanianKeys.length > 0) {
          console.log(`❌ Empty Romanian translations in ${namespace}:`);
          emptyRomanianKeys.forEach(key => console.log(`   - ${key}`));
        }

        expect(emptyEnglishKeys).toHaveLength(0);
        expect(emptyRomanianKeys).toHaveLength(0);
      });
    });
  });

  // Summary test that logs useful information
  test('translation namespace files summary', () => {
    console.log('✅ Translation Namespace Files Summary:');
    console.log(`   � Total namespaces: ${namespaces.length}`);
    console.log(`   �📊 Total keys across all namespaces: ${totalEnglishKeys}`);
    console.log(`   🇺🇸 English keys: ${totalEnglishKeys}`);
    console.log(`   🇷🇴 Romanian keys: ${totalRomanianKeys}`);
    console.log(`   ✨ Structure match: ${totalEnglishKeys === totalRomanianKeys ? 'PERFECT' : 'MISMATCH'}`);
    
    console.log('   � Namespace breakdown:');
    namespaces.forEach(namespace => {
      const data = allNamespaces[namespace];
      console.log(`      ${namespace}: ${data.englishKeys.length} keys`);
    });
    
    expect(totalEnglishKeys).toEqual(totalRomanianKeys);
    expect(totalEnglishKeys).toBeGreaterThan(0);
  });
});
