# Translation System

This project uses **i18next** for internationalization with support for English and Romanian languages.

## File Structure

```
public/locales/
├── en/
│   └── translation.json     # English translations (source of truth)
└── ro/
    └── translation.json     # Romanian translations (must match EN structure)
```

## Key Requirements

⚠️ **CRITICAL**: Both translation files must have **identical key structures**. Every key that exists in English must exist in Romanian, and vice versa.

## Quality Assurance

### Automated Checks

We have automated tools to ensure translation quality:

1. **Translation Keys Test** (`tests/translation-keys.test.js`)
   - Unit test that validates key structure consistency
   - Checks for missing keys, extra keys, and empty values
   - Run with: `npm run test:translations`

2. **Translation Checker Script** (`scripts/check-translations.js`)
   - Standalone script for quick validation
   - Provides colored output with detailed reports
   - Run with: `npm run check:translations`

3. **Pre-build Hook**
   - Automatically runs translation check before building
   - Prevents builds with inconsistent translations
   - Configured in `package.json` as `prebuild` script

### Available NPM Scripts

```bash
# Quick translation check
npm run check:translations

# Run translation unit tests
npm run test:translations

# Run all tests
npm test

# Build (includes pre-build translation check)
npm run build
```

## Adding New Translations

### Process

1. **Add the key to English file first** (`en/translation.json`)
2. **Add the same key to Romanian file** (`ro/translation.json`)
3. **Run the checker** to verify structure: `npm run check:translations`
4. **Test locally** to ensure translations display correctly

### Example

```json
// en/translation.json
{
  "newSection": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}

// ro/translation.json  
{
  "newSection": {
    "title": "Funcționalitate Nouă",
    "description": "Aceasta este o funcționalitate nouă"
  }
}
```

## Key Structure Rules

1. **Nested objects must match exactly**
2. **Array structures must be identical**
3. **Key names must be identical** (only values are translated)
4. **No missing keys allowed**
5. **No extra keys allowed**
6. **No empty string values**

## Common Issues

### ❌ Structure Mismatch
```json
// English
{ "user": { "name": "Name" } }

// Romanian (WRONG)
{ "user": "Utilizator" }
// This breaks the nested structure!

// Romanian (CORRECT)  
{ "user": { "name": "Nume" } }
```

### ❌ Missing Keys
```json
// English
{ "button": { "save": "Save", "cancel": "Cancel" } }

// Romanian (WRONG - missing "cancel")
{ "button": { "save": "Salvează" } }

// Romanian (CORRECT)
{ "button": { "save": "Salvează", "cancel": "Anulează" } }
```

### ❌ Extra Keys
```json
// English
{ "actions": { "edit": "Edit" } }

// Romanian (WRONG - has extra "delete" key)
{ "actions": { "edit": "Editează", "delete": "Șterge" } }
```

## Debugging Translation Issues

1. **Check browser console** for i18next warnings
2. **Run translation checker**: `npm run check:translations`
3. **Look for missing key messages** in Next.js dev server output
4. **Verify key paths** match exactly between files

## Development Workflow

1. **Before making changes**: `npm run check:translations`
2. **After adding translations**: `npm run check:translations`  
3. **Before committing**: `npm run test:translations`
4. **CI/CD will fail** if translations are inconsistent

## Best Practices

- ✅ Always maintain 1:1 key correspondence
- ✅ Use the automated tools before committing
- ✅ Test both languages in development
- ✅ Keep translation values concise and clear
- ✅ Use consistent terminology across the app
- ❌ Never delete keys from one file only
- ❌ Never add keys to one file only
- ❌ Never leave translation values empty
