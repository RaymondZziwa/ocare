-- AlterTable
ALTER TABLE `inventory_records` ADD COLUMN `supplierId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
