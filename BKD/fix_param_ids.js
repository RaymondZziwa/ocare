const fs = require('fs');
const path = require('path');

// Function to recursively find all .ts files
function findTSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTSFiles(fullPath, files);
    } else if (item.endsWith('.controller.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to fix a single controller file
function fixControllerFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: @Param('id') id: number in method parameters
  const paramPattern = /(@Param\('id'\)\s+id:\s+number)/g;
  if (paramPattern.test(content)) {
    content = content.replace(paramPattern, "@Param('id') id: string");
    modified = true;
  }

  // Pattern 2: service calls that need Number() conversion
  // Look for patterns like: service.findOne(id) where id was previously a number
  // We need to find these and wrap them with Number()

  // Find method calls that take id parameter
  const methodCallPatterns = [
    /(\w+)\.findOne\(id\)/g,
    /(\w+)\.findOneEvent\(id\)/g,
    /(\w+)\.update\(id/g,
    /(\w+)\.remove\(id\)/g,
    /(\w+)\.removeEvent\(id\)/g,
    /(\w+)\.delete\(id\)/g,
    /(\w+)\.complete\(id/g,
    /(\w+)\.modifyAttendance\(id/g,
    /(\w+)\.getPayrollPeriod\(id\)/g,
    /(\w+)\.exportProfile\(id\)/g,
    /(\w+)\.disableEmployeeAccount\(id\)/g,
    /(\w+)\.findOneSeedlingStage\(id\)/g,
    /(\w+)\.updateSeedlingStage\(id/g,
    /(\w+)\.removeSeedlingStage\(id\)/g,
    /(\w+)\.findOneSeedlingBatch\(id\)/g,
    /(\w+)\.updateSeedlingBatch\(id/g,
    /(\w+)\.removeSeedlingBatch\(id\)/g,
  ];

  for (const pattern of methodCallPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, (match, serviceName, rest) => {
        if (rest && rest.startsWith('(')) {
          return `${serviceName}.findOne(Number(id))`;
        }
        return `${serviceName}${rest}Number(id)`;
      });
      modified = true;
    }
  }

  // Special handling for more complex patterns
  const complexPatterns = [
    { regex: /(\w+)\.create\(id/g, replacement: '$1.create(Number(id)' },
    { regex: /(\w+)\.findAllStoreInventory\(id/g, replacement: '$1.findAllStoreInventory(Number(id)' },
    { regex: /(\w+)\.findAllCreditSales\(id/g, replacement: '$1.findAllCreditSales(Number(id)' },
    { regex: /(\w+)\.findClientPurchases\(id/g, replacement: '$1.findClientPurchases(Number(id)' },
    { regex: /(\w+)\.findClientPrescriptions\(id/g, replacement: '$1.findClientPrescriptions(Number(id)' },
  ];

  for (const { regex, replacement } of complexPatterns) {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

// Main execution
const srcDir = './src';
const controllerFiles = findTSFiles(srcDir);

console.log(`Found ${controllerFiles.length} controller files`);

for (const file of controllerFiles) {
  fixControllerFile(file);
}

console.log('Done fixing controller files');
