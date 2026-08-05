-- CreateTable
CREATE TABLE `ShopSale` (
    `id` VARCHAR(191) NOT NULL,
    `saleNumber` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `storeId` VARCHAR(191) NOT NULL,
    `servedBy` VARCHAR(191) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'FAILED', 'IN_DELIVERY', 'PACKAGING', 'CANCELLED', 'SUCCESSFUL') NOT NULL DEFAULT 'PENDING',
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `serviceCharge` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `salePaymentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ShopSale_saleNumber_key`(`saleNumber`),
    INDEX `ShopSale_storeId_idx`(`storeId`),
    INDEX `ShopSale_servedBy_idx`(`servedBy`),
    INDEX `ShopSale_customerId_idx`(`customerId`),
    INDEX `ShopSale_status_idx`(`status`),
    INDEX `ShopSale_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SaleItem` (
    `id` VARCHAR(191) NOT NULL,
    `saleId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `unitId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `saleType` ENUM('In_shop', 'Mobile', 'Web') NOT NULL,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SaleItem_saleId_idx`(`saleId`),
    INDEX `SaleItem_itemId_idx`(`itemId`),
    INDEX `SaleItem_batchId_idx`(`batchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DraftSale` (
    `id` VARCHAR(191) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,
    `servedBy` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `cart` JSON NOT NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `amountPaid` DECIMAL(12, 2) NULL,
    `notes` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `paymentStatus` ENUM('FULLY_PAID', 'PARTIALLY_PAID', 'UNPAID') NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DraftSale_servedBy_idx`(`servedBy`),
    INDEX `DraftSale_storeId_idx`(`storeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SaleItemToShopSale` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_SaleItemToShopSale_AB_unique`(`A`, `B`),
    INDEX `_SaleItemToShopSale_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ShopSale` ADD CONSTRAINT `ShopSale_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopSale` ADD CONSTRAINT `ShopSale_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopSale` ADD CONSTRAINT `ShopSale_servedBy_fkey` FOREIGN KEY (`servedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopSale` ADD CONSTRAINT `ShopSale_salePaymentId_fkey` FOREIGN KEY (`salePaymentId`) REFERENCES `sale_payment_transaction_history`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleItem` ADD CONSTRAINT `SaleItem_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleItem` ADD CONSTRAINT `SaleItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleItem` ADD CONSTRAINT `SaleItem_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleItem` ADD CONSTRAINT `SaleItem_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DraftSale` ADD CONSTRAINT `DraftSale_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DraftSale` ADD CONSTRAINT `DraftSale_servedBy_fkey` FOREIGN KEY (`servedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SaleItemToShopSale` ADD CONSTRAINT `_SaleItemToShopSale_A_fkey` FOREIGN KEY (`A`) REFERENCES `SaleItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SaleItemToShopSale` ADD CONSTRAINT `_SaleItemToShopSale_B_fkey` FOREIGN KEY (`B`) REFERENCES `ShopSale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
