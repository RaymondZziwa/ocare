-- AddForeignKey
ALTER TABLE `DraftInvoice` ADD CONSTRAINT `DraftInvoice_receivedBy_fkey` FOREIGN KEY (`receivedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DraftInvoice` ADD CONSTRAINT `DraftInvoice_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DraftInvoice` ADD CONSTRAINT `DraftInvoice_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
