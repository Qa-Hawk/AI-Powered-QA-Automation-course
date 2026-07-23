#!/usr/bin/env node
/**
 * afterFileEdit guard: block edits that weaken Playwright tests under tests/.
 * Exit 0 = allow, exit 2 = block (weakened assertions), other = fail (failClosed).
 */
'use strict';

const fs = require('fs');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function countExpect(text) {
  if (!text) return 0;
  return (text.match(/expect\(/g) || []).length;
}

/** Count expect( that are not inside // or /* comments. */
function countActiveExpect(text) {
  if (!text) return 0;
  const stripped = text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n');
  return (stripped.match(/expect\(/g) || []).length;
}

function isTestPath(filePath) {
  const norm = String(filePath || '').replace(/\\/g, '/');
  return /(^|\/)tests\//.test(norm);
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

function main() {
  const raw = readStdin();
  let payload;
  try {
    payload = JSON.parse(raw || '{}');
  } catch (err) {
    console.error(`block-weakened-tests: invalid JSON on stdin: ${err.message}`);
    process.exit(1);
  }

  const filePath = payload.file_path || payload.filePath || '';
  if (!isTestPath(filePath)) {
    process.exit(0);
  }

  const edits = Array.isArray(payload.edits) ? payload.edits : [];
  const { before, after } = beforeAfterFromEdits(edits);

  // No edit payload to compare — allow (nothing to evaluate).
  if (!before && !after) {
    process.exit(0);
  }

  const oldRaw = countExpect(before);
  const newRaw = countExpect(after);
  const oldActive = countActiveExpect(before);
  const newActive = countActiveExpect(after);

  if (newRaw < oldRaw) {
    console.error(
      `block-weakened-tests: BLOCKED ${filePath} — expect( count fell ${oldRaw} → ${newRaw}`,
    );
    process.exit(2);
  }

  if (newActive < oldActive) {
    console.error(
      `block-weakened-tests: BLOCKED ${filePath} — expect( was commented out or otherwise deactivated (${oldActive} → ${newActive} active)`,
    );
    process.exit(2);
  }

  process.exit(0);
}

main();
