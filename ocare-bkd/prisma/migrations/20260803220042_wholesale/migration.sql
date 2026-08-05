-- AlterTable
ALTER TABLE `items` ADD COLUMN `wholeSalePrice` DECIMAL(10, 2) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE `sales` ADD COLUMN `mode` ENUM('Retail', 'Wholesale') NOT NULL DEFAULT 'Retail';

-- CreateTable
CREATE TABLE `Batch` (
    `id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `type` ENUM('INDIVIDUAL', 'BUSINESSS') NOT NULL DEFAULT 'INDIVIDUAL',
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Supplier_email_key`(`email`),
    UNIQUE INDEX `Supplier_contact_key`(`contact`),
    INDEX `Supplier_firstName_lastName_idx`(`firstName`, `lastName`),
    INDEX `Supplier_contact_idx`(`contact`),
    INDEX `Supplier_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supply` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `qty` DOUBLE NOT NULL,
    `unitId` VARCHAR(191) NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `balance` DECIMAL(10, 2) NOT NULL,
    `recievedBy` VARCHAR(191) NOT NULL,
    `paymentStatus` ENUM('FULLY_PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID',
    `proofImage` VARCHAR(191) NULL,
    `destinationStoreId` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Supply_supplierId_idx`(`supplierId`),
    INDEX `Supply_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupplyPayments` (
    `id` VARCHAR(191) NOT NULL,
    `supplyId` VARCHAR(191) NOT NULL,
    `bank` VARCHAR(191) NULL,
    `chequeNumber` VARCHAR(191) NULL,
    `chequeBankingDate` DATETIME(3) NULL,
    `paymentType` ENUM('CASH', 'CHEQUE', 'MOBILE_MONEY') NOT NULL,
    `barterItemName` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paidBy` VARCHAR(191) NOT NULL,
    `paymentStatus` ENUM('FULLY_PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL,
    `proofImage` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_recievedBy_fkey` FOREIGN KEY (`recievedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_destinationStoreId_fkey` FOREIGN KEY (`destinationStoreId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplyPayments` ADD CONSTRAINT `SupplyPayments_supplyId_fkey` FOREIGN KEY (`supplyId`) REFERENCES `Supply`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplyPayments` ADD CONSTRAINT `SupplyPayments_paidBy_fkey` FOREIGN KEY (`paidBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
