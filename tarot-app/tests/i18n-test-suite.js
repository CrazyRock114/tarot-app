#!/usr/bin/env node
/**
 * i18n Translation Consistency Test Suite
 * 检测项目中所有翻译不一致问题
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${colors.reset}${msg}`),
  success: (msg) => console.log(`${colors.green}✓ ${colors.reset}${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`),
  error: (msg) => console.log(`${colors.red}✗ ${colors.reset}${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}`),
};

// Load translation files
function loadTranslations() {
  const localesDir = path.join(__dirname, '../client/src/i18n/locales');
  const languages = ['zh-CN', 'en', 'ja', 'ko', 'zh-TW'];
  const translations = {};

  for (const lang of languages) {
    const filePath = path.join(localesDir, `${lang}.json`);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      translations[lang] = JSON.parse(content);
    } catch (e) {
      log.error(`Failed to load ${lang}.json: ${e.message}`);
    }
  }

  return translations;
}

// Flatten nested object to dot notation
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
}

// Extract translation keys from source code
function extractTranslationKeys(filePath, content) {
  const keys = new Set();

  // Pattern 1: t('key') or t("key")
  const pattern1 = /t\(['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = pattern1.exec(content)) !== null) {
    keys.add(match[1]);
  }

  // Pattern 2: i18nKey="key"
  const pattern2 = /i18nKey=['"`]([^'"`]+)['"`]/g;
  while ((match = pattern2.exec(content)) !== null) {
    keys.add(match[1]);
  }

  // Pattern 3: Trans components
  const pattern3 = /<Trans[^>]*>([^<]+)<\/Trans>/g;
  while ((match = pattern3.exec(content)) !== null) {
    keys.add(match[1].trim());
  }

  return Array.from(keys);
}

// Scan directory for source files
function scanDirectory(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = [];

  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and dist
        if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
          scan(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

// Check backend API translations
function checkBackendTranslations() {
  log.section('Backend API Translation Check');

  const apiFile = path.join(__dirname, '../api/index.ts');
  const content = fs.readFileSync(apiFile, 'utf-8');

  // Find all t(req, 'key') calls
  const pattern = /t\(req,\s*['"`]([^'"`]+)['"`]/g;
  const keys = new Set();
  let match;

  while ((match = pattern.exec(content)) !== null) {
    keys.add(match[1]);
  }

  log.info(`Found ${keys.size} translation keys in backend`);

  // Check if all keys are defined in MSG object
  const msgPattern = /const MSG = \{[\s\S]*?\};/;
  const msgMatch = content.match(msgPattern);

  if (!msgMatch) {
    log.error('Could not find MSG object in backend');
    return;
  }

  const missingInBackend = [];
  for (const key of keys) {
    // Check if key exists in MSG definition
    const keyPattern = new RegExp(`${key}[:\s]`);
    if (!keyPattern.test(msgMatch[0])) {
      missingInBackend.push(key);
    }
  }

  if (missingInBackend.length > 0) {
    log.warning(`Missing ${missingInBackend.length} keys in backend MSG:`);
    missingInBackend.forEach(k => console.log(`  - ${k}`));
  } else {
    log.success('All backend translation keys are defined');
  }

  return Array.from(keys);
}

// Check for hardcoded Chinese strings
function findHardcodedChinese(files) {
  log.section('Hardcoded Chinese String Detection');

  const chinesePattern = /[\u4e00-\u9fff]+/g;
  const results = [];
  const excludedPatterns = [
    /\/\/.*$/, // Comments
    /\/\*[\s\S]*?\*\//, // Block comments
    /['"`][^'"`]*['"`]/, // Already in strings (handled separately)
  ];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
        continue;
      }

      // Find Chinese characters not inside t() or i18nKey
      const matches = line.match(chinesePattern);
      if (matches) {
        // Check if this line uses translation
        const hasTranslation = /t\(|i18nKey|Trans>|<Trans/.test(line);
        const isStringLiteral = /['"`][^'"`]*[\u4e00-\u9fff]+[^'"`]*['"`]/.test(line);

        if (isStringLiteral && !hasTranslation) {
          results.push({
            file: path.relative(__dirname, file),
            line: i + 1,
            content: line.trim(),
            chinese: matches.join(', '),
          });
        }
      }
    }
  }

  if (results.length > 0) {
    log.warning(`Found ${results.length} potential hardcoded Chinese strings:`);
    results.slice(0, 20).forEach(r => {
      console.log(`\n  ${colors.yellow}${r.file}:${r.line}${colors.reset}`);
      console.log(`    ${r.content.substring(0, 100)}`);
    });
    if (results.length > 20) {
      console.log(`\n  ... and ${results.length - 20} more`);
    }
  } else {
    log.success('No hardcoded Chinese strings found');
  }

  return results;
}

// Compare translation completeness across languages
function compareTranslations(translations) {
  log.section('Translation Completeness Check');

  const languages = Object.keys(translations);
  const flattened = {};

  for (const lang of languages) {
    flattened[lang] = flattenObject(translations[lang]);
  }

  const zhCNKeys = new Set(Object.keys(flattened['zh-CN']));
  const issues = [];

  for (const lang of languages) {
    if (lang === 'zh-CN') continue;

    const langKeys = new Set(Object.keys(flattened[lang]));
    const missing = [...zhCNKeys].filter(k => !langKeys.has(k));
    const extra = [...langKeys].filter(k => !zhCNKeys.has(k));

    if (missing.length > 0) {
      issues.push({ lang, type: 'missing', keys: missing });
    }
    if (extra.length > 0) {
      issues.push({ lang, type: 'extra', keys: extra });
    }

    console.log(`\n${colors.cyan}${lang}:${colors.reset}`);
    console.log(`  Total keys: ${langKeys.size}`);
    console.log(`  Missing: ${missing.length > 0 ? colors.red + missing.length : colors.green + '0'}${colors.reset}`);
    console.log(`  Extra: ${extra.length > 0 ? colors.yellow + extra.length : colors.green + '0'}${colors.reset}`);
  }

  // Print detailed missing keys
  for (const issue of issues.filter(i => i.type === 'missing')) {
    console.log(`\n${colors.red}Missing in ${issue.lang}:${colors.reset}`);
    issue.keys.slice(0, 30).forEach(k => console.log(`  - ${k}`));
    if (issue.keys.length > 30) {
      console.log(`  ... and ${issue.keys.length - 30} more`);
    }
  }

  return issues;
}

// Check for dynamic translation keys (that might cause issues)
function findDynamicKeys(files) {
  log.section('Dynamic Translation Key Detection');

  const dynamicPatterns = [
    { pattern: /t\([\s\S]*?\+\s*['"`]/, desc: 'String concatenation in t()' },
    { pattern: /t\([\s\S]*?\?\s*['"`]/, desc: 'Ternary operator in t()' },
    { pattern: /t\([\s\S]*?\$\{/, desc: 'Template literal in t()' },
    { pattern: /t\(\s*['"`][^'"`]*\$\{/, desc: 'Variable interpolation in key' },
  ];

  const results = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');

    for (const { pattern, desc } of dynamicPatterns) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          results.push({
            file: path.relative(__dirname, file),
            line: i + 1,
            desc,
            content: lines[i].trim(),
          });
        }
      }
    }
  }

  if (results.length > 0) {
    log.warning(`Found ${results.length} dynamic translation keys (potential issues):`);
    results.forEach(r => {
      console.log(`\n  ${colors.yellow}${r.file}:${r.line}${colors.reset} - ${r.desc}`);
      console.log(`    ${r.content.substring(0, 80)}`);
    });
  } else {
    log.success('No dynamic translation keys found');
  }

  return results;
}

// Generate report
function generateReport(results) {
  const reportPath = path.join(__dirname, 'i18n-test-report.md');

  let markdown = `# i18n Translation Test Report\n\n`;
  markdown += `Generated: ${new Date().toISOString()}\n\n`;

  markdown += `## Summary\n\n`;
  markdown += `- Backend translation issues: ${results.backendIssues?.length || 0}\n`;
  markdown += `- Hardcoded Chinese strings: ${results.hardcoded?.length || 0}\n`;
  markdown += `- Missing translations: ${results.missingTranslations?.length || 0}\n`;
  markdown += `- Dynamic key issues: ${results.dynamicKeys?.length || 0}\n\n`;

  if (results.hardcoded?.length > 0) {
    markdown += `## Hardcoded Chinese Strings\n\n`;
    markdown += `| File | Line | Content |\n`;
    markdown += `|------|------|---------|\n`;
    results.hardcoded.forEach(h => {
      markdown += `| ${h.file} | ${h.line} | ${h.content.substring(0, 50).replace(/\|/g, '\\|')} |\n`;
    });
    markdown += `\n`;
  }

  if (results.missingTranslations?.length > 0) {
    markdown += `## Missing Translations\n\n`;
    results.missingTranslations.forEach(m => {
      markdown += `### ${m.lang} (${m.type})\n\n`;
      m.keys.forEach(k => {
        markdown += `- \`${k}\`\n`;
      });
      markdown += `\n`;
    });
  }

  fs.writeFileSync(reportPath, markdown);
  log.info(`Report saved to: ${reportPath}`);
}

// Main function
async function main() {
  console.log(`${colors.magenta}
╔══════════════════════════════════════════════════════════╗
║     i18n Translation Consistency Test Suite              ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

  const translations = loadTranslations();
  log.info(`Loaded ${Object.keys(translations).length} translation files`);

  // Scan client source files
  const clientDir = path.join(__dirname, '../client/src');
  const sourceFiles = scanDirectory(clientDir);
  log.info(`Scanned ${sourceFiles.length} source files`);

  const results = {};

  // Run all checks
  results.backendIssues = checkBackendTranslations();
  results.hardcoded = findHardcodedChinese(sourceFiles);
  results.missingTranslations = compareTranslations(translations);
  results.dynamicKeys = findDynamicKeys(sourceFiles);

  // Generate report
  generateReport(results);

  console.log(`\n${colors.green}══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}Test complete!${colors.reset}`);
  console.log(`${colors.cyan}Review the generated report at: tests/i18n-test-report.md${colors.reset}`);
}

main().catch(console.error);
