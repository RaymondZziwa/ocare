-- AlterTable
ALTER TABLE `items` ADD COLUMN `sideEffects` JSON NULL,
    ADD COLUMN `variation` JSON NULL;

-- AlterTable
ALTER TABLE `sales` MODIFY `saleStatus` ENUM('PENDING', 'FAILED', 'IN_DELIVERY', 'PACKAGING', 'CANCELLED', 'SUCCESSFUL') NOT NULL DEFAULT 'SUCCESSFUL';

-- CreateTable
CREATE TABLE `item_reviews` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(191) NULL,
    `reviewerId` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `item_reviews_itemId_createdAt_idx`(`itemId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `item_reviews` ADD CONSTRAINT `item_reviews_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_reviews` ADD CONSTRAINT `item_reviews_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
