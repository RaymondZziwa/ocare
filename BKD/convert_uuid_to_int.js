const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace primary key UUID declarations with auto-increment integers
schema = schema.replace(/id\s+String\s+@id\s+@default\(uuid\(\)\)\s+@db\.Char\(36\)/g, 'id        Int      @id @default(autoincrement())');

// Replace foreign key UUID declarations with integers
schema = schema.replace(/String\s+@db\.Char\(36\)/g, 'Int');

fs.writeFileSync(schemaPath, schema);
console.log('Schema conversion completed!');
