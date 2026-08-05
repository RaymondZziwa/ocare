/*
  Warnings:

  - You are about to drop the column `servedBy` on the `DraftSale` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `DraftSale` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `DraftSale` DROP FOREIGN KEY `DraftSale_servedBy_fkey`;

-- DropForeignKey
ALTER TABLE `DraftSale` DROP FOREIGN KEY `DraftSale_storeId_fkey`;

-- DropIndex
DROP INDEX `DraftSale_servedBy_idx` ON `DraftSale`;

-- DropIndex
DROP INDEX `DraftSale_storeId_idx` ON `DraftSale`;

-- AlterTable
ALTER TABLE `DraftSale` DROP COLUMN `servedBy`,
    DROP COLUMN `storeId`;
