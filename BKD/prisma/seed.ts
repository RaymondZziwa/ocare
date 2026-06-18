import { PrismaClient } from '@prisma/client';
import { defaultBranches } from './seed/branches';
import { permissions } from './seed/permissions';
import { defaultRoles } from './seed/roles';
import { defaultUser } from './seed/super_user';
import { defaultCompany } from './seed/defaultCompany';
import { unitsOfMeasurement } from './seed/unitsOfMeasurement';

const prisma = new PrismaClient();

// Seed Branches
async function seedUnits() {
  for (const unit of unitsOfMeasurement) {
    await prisma.unit.create({
      data: {
        name: unit.name,
        abr: unit.abr,
        value: unit.value || 1,
      },
    });
  }
  console.log('✅ Units seeded successfully');
}

// Seed Branches
async function seedBranches() {
  for (const branch of defaultBranches) {
    await prisma.branch.create({
      data: {
        name: branch.name,
        location: branch.location,
      },
    });
  }
  console.log('✅ Branches seeded successfully');
}

// Seed Permissions
async function seedPermissions() {
  for (const perm of permissions) {
    await prisma.permission.create({
      data: { name: perm.name, value: perm.value, module: perm.module },
    });
  }
  console.log('✅ Permissions seeded successfully');
}

// Seed Roles
async function seedRoles() {
  for (const role of defaultRoles) {
    await prisma.role.create({
      data: {
        name: role.name,
        permissions: {
          connect: role.permissions.map((permValue: string) => ({
            value: permValue,
          })),
        },
      },
    });
  }
  console.log('✅ Roles seeded successfully');
}

// Seed Default Company
async function seedCompany() {
  for (const comp of defaultCompany) {
    await prisma.company.create({
      data: {
        name: comp.name,
        email: comp.email,
        tel1: comp.tel1,
        tel2: comp.tel2,
        address: comp.address,
        logo: comp.logo,
        website: comp.website,
        tinNumber: comp.tinNumber,
        description: comp.description,
        foundedYear: comp.foundedYear,
        industry: comp.industry,
        employees: comp.employees,
        createdAt: new Date(comp.createdAt),
        updatedAt: new Date(comp.updatedAt),
      },
    });
  }
}
// Seed Users
async function seedUsers() {
  const headOffice = await prisma.branch.findFirst({
    where: { name: 'Head Office' },
  });

  if (!headOffice) throw new Error('Head Office branch not found');

  for (const user of defaultUser) {
    await prisma.employee.create({
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        gender: 'MALE',
        email: user.email,
        tel: user.tel,
        password: user.password,
        salary: user.salary,
        hasAccess: user.hasAccess,
        isActive: user.isActive,
        profileImage: user.profileImage,
        role: {
          connect: { name: 'Administrator' },
        },
        branch: {
          connect: { id: headOffice.id },
        },
      },
    });
  }
  console.log('✅ Users seeded successfully');
}

// Main seed function
async function main() {
  await seedBranches();
  await seedPermissions();
  await seedRoles();
  await seedUsers();
  await seedCompany();
  await seedUnits();

  console.log('✅ All seed operations completed successfully');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
