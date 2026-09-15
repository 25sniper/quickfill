/**
 * Lightweight Static & Structural Inspector for JSX/HTML and Component Files
 * Used in E2E tests to verify DOM hierarchies, attributes, Tailwind class contracts, and ARIA labels.
 */
import fs from 'node:fs';
import path from 'node:path';

export function readSourceFile(relativePath) {
  const fullPath = path.resolve(process.cwd(), relativePath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return fs.readFileSync(fullPath, 'utf8');
}

export function sourceFileExists(relativePath) {
  const fullPath = path.resolve(process.cwd(), relativePath);
  return fs.existsSync(fullPath);
}

/**
 * Checks whether a source file contains an explicit attribute or string
 */
export function containsText(sourceCode, searchString) {
  if (!sourceCode) return false;
  return sourceCode.includes(searchString);
}

/**
 * Checks regex pattern against source code
 */
export function matchesPattern(sourceCode, regex) {
  if (!sourceCode) return false;
  return regex.test(sourceCode);
}

/**
 * Extracts all class/className string literals from source
 */
export function extractClassNames(sourceCode) {
  if (!sourceCode) return [];
  const matches = sourceCode.matchAll(/className=(?:["'`]([^"'`]+)["'`]|{`([^`]+)`})/g);
  const classes = [];
  for (const match of matches) {
    const classStr = match[1] || match[2];
    if (classStr) {
      classes.push(...classStr.split(/\s+/).filter(Boolean));
    }
  }
  return classes;
}

/**
 * Extracts ARIA attributes from source
 */
export function extractAriaAttributes(sourceCode) {
  if (!sourceCode) return [];
  const matches = sourceCode.matchAll(/(aria-[a-z]+|role)=["'`]([^"'`]+)["'`]/g);
  const results = [];
  for (const match of matches) {
    results.push({ name: match[1], value: match[2] });
  }
  return results;
}
