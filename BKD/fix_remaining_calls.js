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

// Function to fix service calls in a single controller file
function fixServiceCalls(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Patterns to replace service calls that pass 'id' directly
  const patterns = [
    // Standard CRUD operations
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.findOne\(id\)/g, replacement: 'this.$1.findOne(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.update\(id,/g, replacement: 'this.$1.update(Number(id),' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.remove\(id\)/g, replacement: 'this.$1.remove(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.delete\(id\)/g, replacement: 'this.$1.delete(Number(id))' },

    // Specific method patterns
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.findOneEvent\(id\)/g, replacement: 'this.$1.findOneEvent(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.removeEvent\(id\)/g, replacement: 'this.$1.removeEvent(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.complete\(id,/g, replacement: 'this.$1.complete(Number(id),' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.modifyAttendance\(id,/g, replacement: 'this.$1.modifyAttendance(Number(id),' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.getPayrollPeriod\(id\)/g, replacement: 'this.$1.getPayrollPeriod(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.exportProfile\(id\)/g, replacement: 'this.$1.exportProfile(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.disableEmployeeAccount\(id\)/g, replacement: 'this.$1.disableEmployeeAccount(Number(id))' },

    // Farm specific methods
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.findOneSeedlingStage\(id\)/g, replacement: 'this.$1.findOneSeedlingStage(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.updateSeedlingStage\(id,/g, replacement: 'this.$1.updateSeedlingStage(Number(id),' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.removeSeedlingStage\(id\)/g, replacement: 'this.$1.removeSeedlingStage(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.findOneSeedlingBatch\(id\)/g, replacement: 'this.$1.findOneSeedlingBatch(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.updateSeedlingBatch\(id,/g, replacement: 'this.$1.updateSeedlingBatch(Number(id),' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.updateSeedlingBatchStatus\(id,/g, replacement: 'this.$1.updateSeedlingBatchStatus(Number(id),' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.removeSeedlingBatch\(id\)/g, replacement: 'this.$1.removeSeedlingBatch(Number(id))' },

    // Sales specific methods
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.getClientPurchases\(id\)/g, replacement: 'this.$1.getClientPurchases(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.getPrescriptions\(id\)/g, replacement: 'this.$1.getPrescriptions(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.findCreditSales\(id\)/g, replacement: 'this.$1.findCreditSales(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.findAllCreditSales\(id\)/g, replacement: 'this.$1.findAllCreditSales(Number(id))' },

    // Expense methods
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.findAll\(id\)/g, replacement: 'this.$1.findAll(Number(id))' },

    // Project methods
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.getPayment\(id\)/g, replacement: 'this.$1.getPayment(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.deletePayment\(id\)/g, replacement: 'this.$1.deletePayment(Number(id))' },
    { regex: /this\.([a-zA-Z_][a-zA-Z0-9_]*)\.getPaymentSchedule\(id\)/g, replacement: 'this.$1.getPaymentSchedule(Number(id))' },
  ];

  for (const { regex, replacement } of patterns) {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed service calls in: ${filePath}`);
  }
}

// Main execution
const srcDir = './src';
const controllerFiles = findTSFiles(srcDir);

console.log(`Processing ${controllerFiles.length} controller files for service call fixes`);

for (const file of controllerFiles) {
  fixServiceCalls(file);
}

console.log('Done fixing service calls in controller files');
