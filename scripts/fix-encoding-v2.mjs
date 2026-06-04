/**
 * Fix remaining mojibake in Settings.tsx
 * 
 * The file is properly UTF-8 encoded, but some characters were double-encoded
 * as UTF-8 bytes then re-interpreted as Latin-1/Windows-1252.
 * 
 * This script reads the file as bytes to find and fix the corrupted sequences.
 */
import { readFileSync, writeFileSync } from "fs";

const filePath = "apps/web/src/routes/Settings.tsx";
const buf = readFileSync(filePath);
let content = buf.toString("utf-8");

// The corrupted patterns are specific bytes that got double-encoded.
// When UTF-8 bytes are read as Latin-1 and re-saved as UTF-8:
// Ú (U+00DA, bytes 0xC3 0x9A) → Ãš (0xC3 0x83 0xC2 0x9A)
// → (U+2192, bytes 0xE2 0x86 0x92) → â†’ (0xC3 0xA2 0xE2 0x80 0xB0 0xC2 0x92)
// And similar for other characters.

const fixes = [
  // "Última" / "Último" 
  [/Ãšltima/g, 'Última'],
  [/Ãšltimo/g, 'Último'],
  
  // Right arrow →
  [/â†’/g, '→'],
  
  // Keyboard emoji (was a rendered emoji that got corrupted)
  [/âŒ¨ï¸/g, '⌨️'],
  
  // Other arrows/symbols
  [/â†º/g, '↺'],
  [/â†/g, '→'],
  
  // Fix "Izquierda → Derecha" and "Derecha → Izquierda" patterns
  [/Izquierda â†’ Derecha/g, 'Izquierda → Derecha'],
  [/Derecha â†’ Izquierda/g, 'Derecha → Izquierda'],
  
  // Fix the shortcuts description text that had corrupted characters
  [/âŒ¨ï¸/g, '⌨️'],
  
  // Fix specific Spanish words that might still be corrupted
  [/Ãºltima/g, 'última'],
  [/Ãºltimo/g, 'último'],
  [/automÃ¡tico/g, 'automático'],
  [/AutomÃ¡tico/g, 'Automático'],
];

let changed = false;
for (const [pattern, replacement] of fixes) {
  const before = content;
  content = content.replace(pattern, replacement);
  if (content !== before) {
    console.log(`Fixed: ${pattern.source}`);
    changed = true;
  }
}

// Write only if changes were made
if (changed) {
  writeFileSync(filePath, content, "utf-8");
  console.log("Done - encoding fixes applied.");
} else {
  console.log("No corrupted patterns found (already fixed).");
}
