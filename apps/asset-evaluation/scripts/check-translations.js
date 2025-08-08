#!/usr/bin/env node

/**
 * Translation Keys Checker (Namespace-based)
 *
 * A standalone script to verify that all translation namespace files have identical key structures.
 * Run this before committing changes to translation files.
 *
 * Usage: node scripts/check-translations.js
 */

const fs = require("fs");
const path = require("path");

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Available namespaces
const namespaces = [
  "common",
  "navigation",
  "property",
  "evaluation",
  "dashboard",
  "forms",
  "landing",
  "features",
];

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function getAllKeys(obj, prefix = "") {
  let keys = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

function loadNamespaceFile(language, namespace) {
  const filePath = path.join(
    __dirname,
    "..",
    "public",
    "locales",
    language,
    `${namespace}.json`,
  );

  try {
    if (!fs.existsSync(filePath)) {
      console.error(colorize("red", `❌ File not found: ${filePath}`));
      return null;
    }

    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(
      colorize("red", `❌ Failed to load ${filePath}: ${error.message}`),
    );
    return null;
  }
}

function findEmptyValues(obj, prefix = "") {
  const empty = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      empty.push(...findEmptyValues(obj[key], fullKey));
    } else if (typeof obj[key] === "string" && obj[key].trim() === "") {
      empty.push(fullKey);
    }
  }
  return empty;
}

function main() {
  console.log(
    colorize("cyan", "🔍 Translation Keys Structure Checker (Namespace-based)"),
  );
  console.log(colorize("cyan", "=".repeat(60)));
  console.log("");

  console.log(colorize("blue", "📖 Loading namespace files..."));

  let totalEnKeys = 0;
  let totalRoKeys = 0;
  let allNamespacesMatch = true;
  let totalEmptyValues = 0;
  const mismatchedNamespaces = [];

  for (const namespace of namespaces) {
    console.log(colorize("magenta", `\n📋 Checking namespace: ${namespace}`));

    const enData = loadNamespaceFile("en", namespace);
    const roData = loadNamespaceFile("ro", namespace);

    if (!enData || !roData) {
      allNamespacesMatch = false;
      mismatchedNamespaces.push(namespace);
      continue;
    }

    const enKeys = getAllKeys(enData).sort();
    const roKeys = getAllKeys(roData).sort();

    totalEnKeys += enKeys.length;
    totalRoKeys += roKeys.length;

    console.log(`   🇺🇸 English keys: ${enKeys.length}`);
    console.log(`   🇷🇴 Romanian keys: ${roKeys.length}`);

    // Check for missing keys in Romanian
    const missingInRo = enKeys.filter((key) => !roKeys.includes(key));
    const missingInEn = roKeys.filter((key) => !enKeys.includes(key));

    if (missingInRo.length > 0 || missingInEn.length > 0) {
      allNamespacesMatch = false;
      mismatchedNamespaces.push(namespace);

      if (missingInRo.length > 0) {
        console.log(
          colorize("red", `   ❌ Missing in Romanian (${missingInRo.length}):`),
        );
        missingInRo.forEach((key) =>
          console.log(colorize("red", `      - ${key}`)),
        );
      }

      if (missingInEn.length > 0) {
        console.log(
          colorize("red", `   ❌ Missing in English (${missingInEn.length}):`),
        );
        missingInEn.forEach((key) =>
          console.log(colorize("red", `      - ${key}`)),
        );
      }
    } else {
      console.log(colorize("green", "   ✅ Perfect match!"));
    }

    // Check for empty values
    const emptyEn = findEmptyValues(enData);
    const emptyRo = findEmptyValues(roData);

    if (emptyEn.length > 0) {
      totalEmptyValues += emptyEn.length;
      console.log(
        colorize("yellow", `   ⚠️  Empty English values (${emptyEn.length}):`),
      );
      emptyEn.forEach((key) =>
        console.log(colorize("yellow", `      - ${key}`)),
      );
    }

    if (emptyRo.length > 0) {
      totalEmptyValues += emptyRo.length;
      console.log(
        colorize("yellow", `   ⚠️  Empty Romanian values (${emptyRo.length}):`),
      );
      emptyRo.forEach((key) =>
        console.log(colorize("yellow", `      - ${key}`)),
      );
    }
  }

  console.log(colorize("cyan", "\n📋 Summary:"));
  console.log(
    `   📚 Namespaces checked: ${colorize("bright", namespaces.length.toString())}`,
  );
  console.log(
    `   🇺🇸 Total English keys: ${colorize("bright", totalEnKeys.toString())}`,
  );
  console.log(
    `   🇷🇴 Total Romanian keys: ${colorize("bright", totalRoKeys.toString())}`,
  );

  if (allNamespacesMatch && totalEnKeys === totalRoKeys) {
    console.log(`   🔄 Structure match: ${colorize("green", "YES")}`);
    console.log("");
    console.log(
      colorize(
        "green",
        "✅ Perfect! All translation namespaces have identical structures.",
      ),
    );
    console.log(
      colorize(
        "green",
        `✅ All ${totalEnKeys} keys are properly synchronized across all namespaces.`,
      ),
    );

    if (totalEmptyValues > 0) {
      console.log(
        colorize(
          "yellow",
          `⚠️  Found ${totalEmptyValues} empty translation values that need attention.`,
        ),
      );
    }

    process.exit(totalEmptyValues > 0 ? 0 : 0); // Exit 0 even with empty values (just warnings)
  } else {
    console.log(`   🔄 Structure match: ${colorize("red", "NO")}`);
    console.log("");
    console.log(colorize("red", "❌ Translation files are not synchronized!"));
    console.log(
      colorize(
        "red",
        `❌ Mismatched namespaces: ${mismatchedNamespaces.join(", ")}`,
      ),
    );
    console.log(
      colorize(
        "red",
        "❌ Please fix the missing/extra keys before proceeding.",
      ),
    );

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getAllKeys, loadNamespaceFile };
