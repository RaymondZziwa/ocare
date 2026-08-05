/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `items` will be added. If there are existing duplicate values, this will fail.
  - Made the column `sku` on table `items` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `items` MODIFY `sku` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `SKUCounter` (
    `id` VARCHAR(191) NOT NULL,
    `prefix` VARCHAR(191) NOT NULL,
    `current` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SKUCounter_prefix_key`(`prefix`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `items_sku_key` ON `items`(`sku`);
