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
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Fix common remaining issues
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Convert string IDs to number IDs in method calls
  const originalContent = content;

  // Fix .includes() calls where number is compared to string array
  content = content.replace(
    /\b(\w+)\.includes\((\w+)\)/g,
    (match, array, value) => {
      // Check if this looks like an authorized personnel check
      if (match.includes('authorized') || match.includes('includes')) {
        return `${array}.includes(${value}.toString())`;
      }
      return match;
    }
  );

  // Fix method calls where number IDs are passed but string expected
  // This is tricky to automate safely, so let's skip for now

  // Fix @IsString() decorators for ID fields to @IsNumber()
  content = content.replace(
    /(@IsString\(\))\s+(\w+Id\?:?\s*number)/g,
    '@IsNumber()  $2'
  );

  // Fix filter operations where storeId is string but should be number
  content = content.replace(
    /storeId:\s*(\w+)/g,
    (match, varName) => {
      if (varName !== 'undefined') {
        return `storeId: ${varName} ? Number(${varName}) : undefined`;
      }
      return match;
    }
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
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
