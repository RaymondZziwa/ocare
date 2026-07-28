/*
  Warnings:

  - You are about to drop the column `deptId` on the `stores` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `stores_branchId_fkey`;

-- DropIndex
DROP INDEX `stores_branchId_deptId_idx` ON `stores`;

-- AlterTable
ALTER TABLE `stores` DROP COLUMN `deptId`;

-- CreateIndex
CREATE INDEX `stores_branchId_idx` ON `stores`(`branchId`);
