-- AlterTable
ALTER TABLE `DraftInvoice` MODIFY `invoiceDate` DATETIME(3) NULL,
    MODIFY `items` JSON NULL,
    MODIFY `receivedBy` VARCHAR(191) NULL,
    MODIFY `storeId` VARCHAR(191) NULL,
    MODIFY `supplierId` VARCHAR(191) NULL;
