/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Supplier` ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('INDIVIDUAL', 'BUSINESSS') NOT NULL DEFAULT 'INDIVIDUAL';

-- AlterTable
ALTER TABLE `item_categories` ADD COLUMN `code` VARCHAR(191) NULL,
    ADD COLUMN `description` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_email_key` ON `Supplier`(`email`);
