/*
  Warnings:

  - You are about to drop the column `brandId` on the `items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_brandId_fkey`;

-- DropIndex
DROP INDEX `items_brandId_fkey` ON `items`;

-- AlterTable
ALTER TABLE `items` DROP COLUMN `brandId`;
