const fs = require("fs");
const path = "backend/services/wineData/datasets/raw/batch-2025-11-10.json";
let text = fs.readFileSync(path, "utf8");
text = text.replace(/}\s*\n\s*{/g, "},\n  {");
text = text.replace(/\n\s*},\s*\n\s*"averageRating"/g, "\n  ],\n  \"averageRating\"");
try {
  const data = JSON.parse(text);
  console.log("Parsed objects:", data.length);
} catch (err) {
  console.error("Parse error:", err.message);
  if (err.lineNumber) {
    const lines = text.split(/\n/);
    console.error("Context near line", err.lineNumber, ":");
    console.error(lines.slice(Math.max(0, err.lineNumber - 3), err.lineNumber + 2).join("\n"));
  }
  process.exit(1);
}
fs.writeFileSync(path, text);
