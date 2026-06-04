/**
 * Fix mojibake (double-encoded UTF-8) in Settings.tsx
 * 
 * The file was originally UTF-8 Spanish but was read as Latin-1 and 
 * re-encoded as UTF-8, producing garbled characters.
 * 
 * This script reverses the corruption by:
 * 1. Reading the file as-is (UTF-8)
 * 2. Converting each corrupted byte sequence back to its intended character
 */

import { readFileSync, writeFileSync } from "fs";

const filePath = "apps/web/src/routes/Settings.tsx";
let content = readFileSync(filePath, "utf-8");

// Map of corrupted sequences → correct characters
const fixes = [
  // Common Spanish accented characters
  [/Ã¡/g, "á"], [/Ã©/g, "é"], [/Ã\xad/g, "í"], [/Ã³/g, "ó"], [/Ãº/g, "ú"],
  [/Ã±/g, "ñ"], [/Ã¼/g, "ü"], [/Ã\x81/g, "Á"], [/Ã\x89/g, "É"],
  [/Ã\x8d/g, "Í"], [/Ã\x93/g, "Ó"], [/Ã\x9a/g, "Ú"], [/Ã\x91/g, "Ñ"],
  
  // Special punctuation and symbols
  [/Â¿/g, "¿"], [/Â¡/g, "¡"], [/Â·/g, "·"], [/Â°/g, "°"],
  [/â€”/g, "—"], [/â€“/g, "–"], [/â€¢/g, "•"], [/â€¦/g, "…"],
  [/â†’/g, "→"], [/â†•/g, "↔"], [/â†˜/g, "↘"], [/â†‘/g, "↑"], [/â†“/g, "↓"],
  [/â—‹/g, "◦"], [/â—/g, "●"], [/â—£/g, "◆"],
  
  // Curly/smart quotes
  [/â€˜/g, "‘"], [/â€™/g, "'"], [/â€š/g, "‚"],
  [/â€œ/g, "\u201C"], [/â€\x9d/g, "\u201D"], [/â€ž/g, "„"],
  
  // 'a' with various diacritics
  [/Ä\x81/g, "ā"], [/Ä\x93/g, "ō"], [/Ä«/g, "ī"],
  [/ã\x81/g, "à"], [/ã\xa1/g, "á"], [/ã\xa3/g, "ã"], [/ã£/g, "ã"],
  
  // Euro and currency
  [/â‚¬/g, "€"],
  
  // Line/box drawing corrupted characters
  [/Ã¢/g, "â"], [/Ã¢\x80/g, ""],
  
  // Generic cleanup of isolated corruption
  [/Ã¼ber/g, "über"],
  
  // Fix "Manual —" type patterns
  [/ — /g, " — "],  // em dash already handled above
  
  // Fix specific patterns found in the file
  [/SÃ­/g, "Sí"],
  [/BotÃ³n/g, "Botón"],
  [/Ã¡ximo/g, "áximo"],
  [/automÃ¡tico/g, "automático"],
  [/mÃ¡s/g, "más"],
  [/lÃ­mite/g, "límite"],
  [/dÃ­a/g, "día"],
  [/nÃºmero/g, "número"],
];

for (const [pattern, replacement] of fixes) {
  content = content.replace(pattern, replacement);
}

writeFileSync(filePath, content, "utf-8");
console.log("Fixed encoding issues in Settings.tsx");
