/*
  Warnings:

  - You are about to drop the column `barcode` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `barcodeType` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `buyingPrice` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `sellingPrice` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `wholesalePrice` on the `items` table. All the data in the column will be lost.
  - You are about to drop the `Supply` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SupplyPayments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[itemId,number]` on the table `Batch` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `brandId` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyingPrice` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellingPrice` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wholesalePrice` to the `Batch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Supply` DROP FOREIGN KEY `Supply_destinationStoreId_fkey`;

-- DropForeignKey
ALTER TABLE `Supply` DROP FOREIGN KEY `Supply_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `Supply` DROP FOREIGN KEY `Supply_recievedBy_fkey`;

-- DropForeignKey
ALTER TABLE `Supply` DROP FOREIGN KEY `Supply_supplierId_fkey`;

-- DropForeignKey
ALTER TABLE `Supply` DROP FOREIGN KEY `Supply_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `SupplyPayments` DROP FOREIGN KEY `SupplyPayments_paidBy_fkey`;

-- DropForeignKey
ALTER TABLE `SupplyPayments` DROP FOREIGN KEY `SupplyPayments_supplyId_fkey`;

-- DropIndex
DROP INDEX `items_barcode_idx` ON `items`;

-- AlterTable
ALTER TABLE `Batch` ADD COLUMN `barcode` VARCHAR(191) NULL,
    ADD COLUMN `barcodeType` VARCHAR(191) NULL,
    ADD COLUMN `brandId` VARCHAR(191) NOT NULL,
    ADD COLUMN `buyingPrice` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `itemId` VARCHAR(191) NOT NULL,
    ADD COLUMN `manufactureDate` DATETIME(3) NULL,
    ADD COLUMN `sellingPrice` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `wholesalePrice` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `Supplier` MODIFY `firstName` VARCHAR(191) NULL,
    MODIFY `lastName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `inventory_records` ADD COLUMN `batchId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `items` DROP COLUMN `barcode`,
    DROP COLUMN `barcodeType`,
    DROP COLUMN `buyingPrice`,
    DROP COLUMN `sellingPrice`,
    DROP COLUMN `wholesalePrice`;

-- DropTable
DROP TABLE `Supply`;

-- DropTable
DROP TABLE `SupplyPayments`;

-- CreateTable
CREATE TABLE `BatchInventory` (
    `id` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BatchInventory_storeId_idx`(`storeId`),
    UNIQUE INDEX `BatchInventory_batchId_storeId_key`(`batchId`, `storeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Batch_itemId_idx` ON `Batch`(`itemId`);

-- CreateIndex
CREATE INDEX `Batch_expiryDate_idx` ON `Batch`(`expiryDate`);

-- CreateIndex
CREATE INDEX `Batch_barcode_idx` ON `Batch`(`barcode`);

-- CreateIndex
CREATE UNIQUE INDEX `Batch_itemId_number_key` ON `Batch`(`itemId`, `number`);

-- AddForeignKey
ALTER TABLE `Batch` ADD CONSTRAINT `Batch_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Batch` ADD CONSTRAINT `Batch_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchInventory` ADD CONSTRAINT `BatchInventory_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchInventory` ADD CONSTRAINT `BatchInventory_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
