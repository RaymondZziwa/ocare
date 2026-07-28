/*
  Warnings:

  - You are about to drop the `_BranchToEmployee` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `branchId` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_BranchToEmployee` DROP FOREIGN KEY `_BranchToEmployee_A_fkey`;

-- DropForeignKey
ALTER TABLE `_BranchToEmployee` DROP FOREIGN KEY `_BranchToEmployee_B_fkey`;

-- AlterTable
ALTER TABLE `employees` ADD COLUMN `branchId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_BranchToEmployee`;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
