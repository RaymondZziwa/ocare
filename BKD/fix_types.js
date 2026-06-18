const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Find all TypeScript files in src directory
async function findTsFiles() {
  const pattern = 'src/**/*.ts';
  try {
    const files = await glob(pattern, { cwd: process.cwd() });
    return files;
  } catch (error) {
    console.error('Error finding files:', error);
    return [];
  }
}

// Common patterns to fix
const patterns = [
  // DTO interfaces with string IDs -> number IDs
  { from: /id\?: string;/g, to: 'id?: number;' },
  { from: /id: string;/g, to: 'id: number;' },

  // Foreign key fields in DTOs
  { from: /(\w+Id)\?: string;/g, to: '$1?: number;' },
  { from: /(\w+Id): string;/g, to: '$1: number;' },

  // Service method parameters
  { from: /\b(\w+Id): string\)/g, to: '$1: number)' },
  { from: /\b(\w+Id): string,/g, to: '$1: number,' },

  // Query objects
  { from: /id: "[^"]*"/g, to: 'id: 0' }, // This is tricky, better to handle manually
];

async function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  // Apply basic ID type fixes
  const originalContent = content;

  // Fix id: string to id: number
  content = content.replace(/\bid: string\b/g, 'id: number');

  // Fix id?: string to id?: number
  content = content.replace(/\bid\?: string\b/g, 'id?: number');

  // Fix common foreign key patterns (be careful with this)
  content = content.replace(/(\w+Id): string\b/g, '$1: number');
  content = content.replace(/(\w+Id)\?: string\b/g, '$1?: number');

  // Fix method parameters
  content = content.replace(/(\w+Id): string\)/g, '$1: number)');
  content = content.replace(/(\w+Id): string,/g, '$1: number,');

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${filePath}`);
    changed = true;
  }

  return changed;
}

async function main() {
  console.log('Starting type fixes...');

  const files = await findTsFiles();
  console.log(`Found ${files.length} TypeScript files`);

  let fixedCount = 0;
  for (const file of files) {
    try {
      if (await fixFile(file)) {
        fixedCount++;
      }
    } catch (error) {
      console.error(`Error fixing ${file}:`, error.message);
    }
  }

  console.log(`Fixed ${fixedCount} files`);
  console.log('Type fixing completed. You may still need to manually fix complex cases.');
}

main().catch(console.error);
