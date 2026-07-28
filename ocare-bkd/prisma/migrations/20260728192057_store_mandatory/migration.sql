/*
  Warnings:

  - Made the column `storeId` on table `sales` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `sales_storeId_fkey`;

-- AlterTable
ALTER TABLE `sales` MODIFY `storeId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
