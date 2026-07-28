-- CreateTable
CREATE TABLE `product_inventory` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,
    `qty` DOUBLE NOT NULL,
    `unitId` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `product_inventory_storeId_itemId_idx`(`storeId`, `itemId`),
    INDEX `product_inventory_qty_idx`(`qty`),
    UNIQUE INDEX `product_inventory_itemId_storeId_unitId_key`(`itemId`, `storeId`, `unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_records` (
    `id` VARCHAR(191) NOT NULL,
    `category` ENUM('Restock', 'Depletion', 'Transfer', 'Adjustment', 'Manufacturing') NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,
    `toStoreId` VARCHAR(191) NULL,
    `initiatedQty` DOUBLE NULL,
    `qty` DOUBLE NOT NULL,
    `remainingQuantity` DOUBLE NULL,
    `unitId` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `recordedBy` VARCHAR(191) NOT NULL,
    `transferId` VARCHAR(191) NULL,
    `transferStatus` ENUM('Confirmed', 'Pending', 'Rejected') NOT NULL DEFAULT 'Confirmed',
    `isResolved` BOOLEAN NULL,
    `resolveNotes` VARCHAR(191) NULL,
    `images` JSON NULL,
    `extraNote` VARCHAR(191) NULL,
    `expectedOutput` DOUBLE NULL,
    `recordedOutput` DOUBLE NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inventory_records_storeId_createdAt_idx`(`storeId`, `createdAt`),
    INDEX `inventory_records_itemId_createdAt_idx`(`itemId`, `createdAt`),
    INDEX `inventory_records_category_createdAt_idx`(`category`, `createdAt`),
    INDEX `inventory_records_recordedBy_createdAt_idx`(`recordedBy`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_inventory` ADD CONSTRAINT `product_inventory_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_inventory` ADD CONSTRAINT `product_inventory_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_inventory` ADD CONSTRAINT `product_inventory_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_toStoreId_fkey` FOREIGN KEY (`toStoreId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
