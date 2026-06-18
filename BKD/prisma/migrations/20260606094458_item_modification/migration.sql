/*
  Warnings:

  - You are about to drop the column `manufacturingCountryId` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `items` table. All the data in the column will be lost.
  - Added the required column `brand` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyingPrice` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellingPrice` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_manufacturingCountryId_fkey`;

-- DropIndex
DROP INDEX `items_manufacturingCountryId_fkey` ON `items`;

-- AlterTable
ALTER TABLE `items` DROP COLUMN `manufacturingCountryId`,
    DROP COLUMN `price`,
    ADD COLUMN `alertStockLevel` DOUBLE NULL,
    ADD COLUMN `barcodeType` VARCHAR(191) NULL,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `buyingPrice` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `sellingPrice` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `unit` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_brand_fkey` FOREIGN KEY (`brand`) REFERENCES `ManufacturingCountry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
