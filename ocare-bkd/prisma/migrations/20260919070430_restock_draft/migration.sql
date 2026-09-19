-- CreateTable
CREATE TABLE `DraftInvoice` (
    `id` VARCHAR(191) NOT NULL,
    `deliveryNoteNumber` VARCHAR(191) NULL,
    `invoiceDate` VARCHAR(191) NULL,
    `items` JSON NOT NULL,
    `receivedBy` VARCHAR(191) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
