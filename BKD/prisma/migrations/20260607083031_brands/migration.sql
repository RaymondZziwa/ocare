/*
  Warnings:

  - You are about to drop the `ManufacturingCountry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_brand_fkey`;

-- DropIndex
DROP INDEX `items_brand_fkey` ON `items`;

-- AlterTable
ALTER TABLE `items` ADD COLUMN `image` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `ManufacturingCountry`;

-- CreateTable
CREATE TABLE `Brand` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_brand_fkey` FOREIGN KEY (`brand`) REFERENCES `Brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
