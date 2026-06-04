/**
 * Final encoding fix for Settings.tsx
 * 
 * This script reads the file byte-by-byte to identify and fix
 * double-encoded UTF-8 characters (mojibake).
 */
import { readFileSync, writeFileSync } from "fs";

const filePath = "apps/web/src/routes/Settings.tsx";
let content = readFileSync(filePath, "utf-8");
const original = content;

// Print the status of known corrupted patterns
const check = (pattern, name) => {
  const matches = content.match(new RegExp(pattern, 'g'));
  if (matches) {
    console.log(`Found ${matches.length} of "${name}": ${JSON.stringify(matches.slice(0,5))}`);
  }
  return matches ? matches.length : 0;
};

console.log("=== Checking for corrupted patterns ===");

// 1. The "Ãš" pattern for Ú (Última)
check('Ãš', 'Ãš → Ú');

// 2. The "âŒ" pattern (keyboard emoji corruption)
check('âŒ¨ï¸', 'âŒ¨ï¸ → keyboard emoji');

// 3. The "â†" pattern (arrow corruption)
check('â†’', 'â†’ → →');
check('â†º', 'â†º → ↺');

// Now fix each pattern
const replacements = [
  [/Ãšltimo\b/g, 'Último'],
  [/Ãšltima\b/g, 'Última'],
  [/âŒ¨ï¸/g, '⌨️'],
  [/â†º/g, '↺'],
  [/â†’/g, '→'],
];

for (const [pattern, replacement] of replacements) {
  content = content.replace(pattern, replacement);
}

if (content !== original) {
  writeFileSync(filePath, content, "utf-8");
  console.log("\n=== Changes made ===");
  
  // Show diffs
  const origLines = original.split('\n');
  const newLines = content.split('\n');
  for (let i = 0; i < Math.min(origLines.length, newLines.length); i++) {
    if (origLines[i] !== newLines[i]) {
      console.log(`Line ${i+1}:`);
      console.log(`  - ${origLines[i].trim()}`);
      console.log(`  + ${newLines[i].trim()}`);
    }
  }
} else {
  console.log("\n=== No changes needed ===");
}

console.log("\n=== Verification ===");
const final = readFileSync(filePath, "utf-8");
let remaining = 0;
for (const [pattern] of replacements) {
  if (pattern.test(final)) {
    console.log(`STILL HAS: ${pattern.source}`);
    remaining++;
  }
}
if (remaining === 0) console.log("All corrupted patterns fixed!");
