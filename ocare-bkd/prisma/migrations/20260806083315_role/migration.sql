/*
  Warnings:

  - You are about to drop the `_EmployeeToRole` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roleId` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_EmployeeToRole` DROP FOREIGN KEY `_EmployeeToRole_A_fkey`;

-- DropForeignKey
ALTER TABLE `_EmployeeToRole` DROP FOREIGN KEY `_EmployeeToRole_B_fkey`;

-- AlterTable
ALTER TABLE `employees` ADD COLUMN `roleId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_EmployeeToRole`;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
