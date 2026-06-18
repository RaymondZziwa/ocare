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

// Fix malformed syntax: "string: number;" -> "number;"
function fixSyntax(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Fix the malformed syntax
  content = content.replace(/: string: number;/g, ': number;');
  content = content.replace(/: string: number\)/g, ': number)');
  content = content.replace(/: string: number,/g, ': number,');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed syntax in: ${filePath}`);
    return true;
  }

  return false;
}

function main() {
  const srcDir = path.join(__dirname, 'src');
  const files = findTsFiles(srcDir);

  console.log(`Found ${files.length} TypeScript files to check`);

  let fixedCount = 0;
  files.forEach(file => {
    try {
      if (fixSyntax(file)) {
        fixedCount++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });

  console.log(`Fixed syntax in ${fixedCount} files`);
}

main();
