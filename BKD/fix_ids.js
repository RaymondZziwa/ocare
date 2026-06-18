const fs = require('fs');
const path = require('path');

// Function to recursively find all .ts files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Patterns to replace
const replacements = [
  // Method parameters: id: string -> id: number
  { pattern: /\b(id:\s*string)\b/g, replacement: 'id: number' },
  { pattern: /\b(\w+Id:\s*string)\b/g, replacement: '$1: number' },

  // Interface properties: id: string -> id: number
  { pattern: /\s+id:\s*string;/g, replacement: '  id: number;' },
  { pattern: /\s+id\?:\s*string;/g, replacement: '  id?: number;' },

  // Foreign key properties
  { pattern: /\s+(\w+Id):\s*string;/g, replacement: '  $1: number;' },
  { pattern: /\s+(\w+Id)\?:\s*string;/g, replacement: '  $1?: number;' },
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  replacements.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
    return true;
  }

  return false;
}

function main() {
  const srcDir = path.join(__dirname, 'src');
  const files = findTsFiles(srcDir);

  console.log(`Found ${files.length} TypeScript files to process`);

  let fixedCount = 0;
  files.forEach(file => {
    try {
      if (fixFile(file)) {
        fixedCount++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });

  console.log(`Fixed ${fixedCount} files`);
}

main();
