-- AlterTable
ALTER TABLE `Address` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL;

-- AlterTable
ALTER TABLE `ShopSale` MODIFY `status` ENUM('AWAITING_PAYMENT', 'PENDING', 'FAILED', 'IN_DELIVERY', 'PACKAGING', 'CANCELLED', 'SUCCESSFUL') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `sales` ADD COLUMN `deliveryFee` DECIMAL(10, 2) NULL,
    ADD COLUMN `paidAt` DATETIME(3) NULL,
    ADD COLUMN `refundedAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `scheduledFor` DATETIME(3) NULL,
    ADD COLUMN `subtotal` DECIMAL(10, 2) NULL,
    MODIFY `saleStatus` ENUM('AWAITING_PAYMENT', 'PENDING', 'FAILED', 'IN_DELIVERY', 'PACKAGING', 'CANCELLED', 'SUCCESSFUL') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `client_wallets` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `balance` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `client_wallets_clientId_key`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet_entries` (
    `id` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NOT NULL,
    `type` ENUM('TOPUP', 'PAYMENT', 'REFUND', 'ADJUSTMENT') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `balanceAfter` DECIMAL(12, 2) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `saleId` VARCHAR(191) NULL,
    `paymentId` VARCHAR(191) NULL,
    `refundId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wallet_entries_walletId_createdAt_idx`(`walletId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_payments` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `purpose` ENUM('ORDER', 'WALLET_TOPUP') NOT NULL,
    `saleId` VARCHAR(191) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `network` VARCHAR(191) NULL,
    `reference` VARCHAR(191) NOT NULL,
    `providerUuid` VARCHAR(191) NULL,
    `providerRef` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'SUCCESSFUL', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `failureReason` VARCHAR(191) NULL,
    `rawCallback` JSON NULL,
    `completedAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `app_payments_reference_key`(`reference`),
    INDEX `app_payments_clientId_createdAt_idx`(`clientId`, `createdAt`),
    INDEX `app_payments_saleId_idx`(`saleId`),
    INDEX `app_payments_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` VARCHAR(191) NOT NULL,
    `saleId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `destination` ENUM('WALLET', 'MOBILE_MONEY') NOT NULL,
    `phone` VARCHAR(191) NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PROCESSING',
    `reference` VARCHAR(191) NULL,
    `failureReason` VARCHAR(191) NULL,
    `requestedBy` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NULL,
    `completedAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refunds_reference_key`(`reference`),
    INDEX `refunds_saleId_idx`(`saleId`),
    INDEX `refunds_clientId_createdAt_idx`(`clientId`, `createdAt`),
    INDEX `refunds_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `client_wallets` ADD CONSTRAINT `client_wallets_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_entries` ADD CONSTRAINT `wallet_entries_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `client_wallets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_payments` ADD CONSTRAINT `app_payments_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_payments` ADD CONSTRAINT `app_payments_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
