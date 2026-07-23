#!/usr/bin/env node
/**
 * afterFileEdit guard (matcher: Write): block mechanically-checkable constitution WON'T
 * violations in tests/** and pages/**. Path filtering is done here — afterFileEdit
 * matchers filter tool type, not file paths.
 *
 * Exit 0 = allow, exit 2 = block, other = fail (failClosed).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const HOOK = 'block-wont-violations';

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function normalizePath(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

/** Only guard tests/** and pages/** (relative or absolute paths). */
function isGuardedPath(filePath) {
  const norm = normalizePath(filePath);
  return /(^|\/)(tests|pages)\//.test(norm);
}

function isTestPath(filePath) {
  return /(^|\/)tests\//.test(normalizePath(filePath));
}

/** Strip // and /* comments without touching // inside strings. */
function stripComments(text) {
  if (!text) return '';
  let out = '';
  let i = 0;
  let state = 'code'; // code | squote | dquote | template | linecomment | blockcomment
  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];

    if (state === 'linecomment') {
      if (c === '\n') {
        out += c;
        state = 'code';
      }
      i += 1;
      continue;
    }
    if (state === 'blockcomment') {
      if (c === '*' && next === '/') {
        i += 2;
        state = 'code';
        continue;
      }
      i += 1;
      continue;
    }
    if (state === 'squote') {
      out += c;
      if (c === '\\' && next !== undefined) {
        out += next;
        i += 2;
        continue;
      }
      if (c === "'") state = 'code';
      i += 1;
      continue;
    }
    if (state === 'dquote') {
      out += c;
      if (c === '\\' && next !== undefined) {
        out += next;
        i += 2;
        continue;
      }
      if (c === '"') state = 'code';
      i += 1;
      continue;
    }
    if (state === 'template') {
      out += c;
      if (c === '\\' && next !== undefined) {
        out += next;
        i += 2;
        continue;
      }
      if (c === '`') state = 'code';
      i += 1;
      continue;
    }

    // code
    if (c === '/' && next === '/') {
      state = 'linecomment';
      i += 2;
      continue;
    }
    if (c === '/' && next === '*') {
      state = 'blockcomment';
      i += 2;
      continue;
    }
    if (c === "'") {
      state = 'squote';
      out += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      state = 'dquote';
      out += c;
      i += 1;
      continue;
    }
    if (c === '`') {
      state = 'template';
      out += c;
      i += 1;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

function countExpect(text) {
  if (!text) return 0;
  return (text.match(/expect\s*\(/g) || []).length;
}

function countActiveExpect(text) {
  return countExpect(stripComments(text));
}

function beforeAfterFromEdits(edits) {
  let before = '';
  let after = '';
  for (const edit of edits) {
    before += edit.old_string ?? edit.oldString ?? '';
    after += edit.new_string ?? edit.newString ?? '';
  }
  return { before, after };
}

/** Prefer edit new_string (what the write introduced); else file on disk. */
function resolveContentToScan(filePath, editsAfter) {
  if (editsAfter) return editsAfter;
  if (!filePath) return '';
  try {
    const abs = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);
    return fs.readFileSync(abs, 'utf8');
  } catch {
    return '';
  }
}

/**
 * @returns {string[]} violation messages
 */
function findAbsoluteViolations(content, filePath) {
  const violations = [];
  if (!content) return violations;

  const active = stripComments(content);

  if (/\.waitForTimeout\s*\(/.test(active)) {
    violations.push('waitForTimeout (fixed sleep)');
  }

  // Playwright XPath: xpath=…, locator('//…'), $x(
  if (
    /\bxpath\s*=/i.test(active) ||
    /\.locator\s*\(\s*['"`]\s*\/\//.test(active) ||
    /\$x\s*\(/.test(active)
  ) {
    violations.push('XPath locator');
  }

  // TypeScript `any` (avoid matching identifiers like "company")
  if (/:\s*any\b/.test(active) || /\bas\s+any\b/.test(active) || /<any>/.test(active) || /\bany\s*\[\]/.test(active)) {
    violations.push('TypeScript `any`');
  }

  // Hardcoded credentials / secrets (string literals — not process.env)
  const secretAssign =
    /(?:password|passwd|secret|api[_-]?key|api[_-]?token|access[_-]?token|auth[_-]?token|DIDAXIS_PASSWORD|DIDAXIS_EMAIL|DIDAXIS_API_TOKEN)\s*[:=]\s*['"`](?!\$\{)[^'"`]{3,}['"`]/i;
  const bearerLiteral = /Bearer\s+[A-Za-z0-9._\-+/=]{16,}/;
  if (secretAssign.test(active) || bearerLiteral.test(active)) {
    violations.push('hardcoded credential/secret');
  }

  // Tag on test.describe(...) — tags belong on individual tests only
  if (isTestPath(filePath)) {
    const describeWithTag =
      /test\.describe(?:\.(?:only|skip|fix|serial|parallel))?\s*\(\s*(?:`[^`]*`|'[^']*'|"[^"]*")\s*,\s*\{[\s\S]{0,400}?\btag\s*:/;
    if (describeWithTag.test(active)) {
      violations.push('tag on test.describe()');
    }
  }

  return violations;
}

function findWeakenedExpect(before, after, filePath) {
  if (!isTestPath(filePath)) return null;
  if (!before && !after) return null;

  const oldRaw = countExpect(before);
  const newRaw = countExpect(after);
  const oldActive = countActiveExpect(before);
  const newActive = countActiveExpect(after);

  if (newRaw < oldRaw) {
    return `removed/weakened expect( (${oldRaw} → ${newRaw})`;
  }
  if (newActive < oldActive) {
    return `expect( commented out or deactivated (${oldActive} → ${newActive} active)`;
  }
  return null;
}

function block(filePath, reasons) {
  const list = reasons.map((r) => `  - ${r}`).join('\n');
  console.error(`${HOOK}: BLOCKED ${normalizePath(filePath)}\n${list}`);
  process.exit(2);
}

function main() {
  const raw = readStdin();
  let payload;
  try {
    payload = JSON.parse(raw || '{}');
  } catch (err) {
    console.error(`${HOOK}: invalid JSON on stdin: ${err.message}`);
    process.exit(1);
  }

  const filePath = payload.file_path || payload.filePath || '';
  if (!isGuardedPath(filePath)) {
    process.exit(0);
  }

  const edits = Array.isArray(payload.edits) ? payload.edits : [];
  const { before, after } = beforeAfterFromEdits(edits);
  const content = resolveContentToScan(filePath, after);

  const reasons = findAbsoluteViolations(content, filePath);
  const weakened = findWeakenedExpect(before, after, filePath);
  if (weakened) reasons.push(weakened);

  if (reasons.length > 0) {
    block(filePath, reasons);
  }

  process.exit(0);
}

main();
