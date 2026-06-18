/*
  Warnings:

  - You are about to drop the column `brand` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `items` table. All the data in the column will be lost.
  - Added the required column `brandId` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_brand_fkey`;

-- DropIndex
DROP INDEX `items_brand_fkey` ON `items`;

-- AlterTable
ALTER TABLE `items` DROP COLUMN `brand`,
    DROP COLUMN `unit`,
    ADD COLUMN `brandId` VARCHAR(191) NOT NULL,
    ADD COLUMN `unitId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `SaleTimeLine` (
    `id` VARCHAR(191) NOT NULL,
    `saleId` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleTimeLine` ADD CONSTRAINT `SaleTimeLine_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
