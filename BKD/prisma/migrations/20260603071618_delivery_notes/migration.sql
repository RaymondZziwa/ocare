/*
  Warnings:

  - The primary key for the `DeliveryNote` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `inventory_records` DROP FOREIGN KEY `inventory_records_deliveryNoteId_fkey`;

-- DropIndex
DROP INDEX `inventory_records_deliveryNoteId_fkey` ON `inventory_records`;

-- AlterTable
ALTER TABLE `DeliveryNote` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `inventory_records` MODIFY `deliveryNoteId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_deliveryNoteId_fkey` FOREIGN KEY (`deliveryNoteId`) REFERENCES `DeliveryNote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
