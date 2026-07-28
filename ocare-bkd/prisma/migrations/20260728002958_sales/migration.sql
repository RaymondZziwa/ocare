-- CreateTable
CREATE TABLE `sales` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('In_Shop', 'App', 'Web') NOT NULL DEFAULT 'In_Shop',
    `clientId` VARCHAR(191) NOT NULL,
    `items` JSON NOT NULL,
    `servedBy` VARCHAR(191) NULL,
    `storeId` VARCHAR(191) NULL,
    `saleStatus` ENUM('PENDING', 'FAILED', 'IN_DELIVERY', 'PACKAGING', 'CANCELLED', 'SUCCESSFUL') NOT NULL DEFAULT 'SUCCESSFUL',
    `salePaymentId` VARCHAR(191) NOT NULL,
    `status` ENUM('FULLY_PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL DEFAULT 'FULLY_PAID',
    `total` DECIMAL(10, 2) NOT NULL,
    `balance` DECIMAL(10, 2) NOT NULL,
    `paymentMethods` JSON NOT NULL,
    `notes` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sales_salePaymentId_key`(`salePaymentId`),
    INDEX `sales_storeId_createdAt_idx`(`storeId`, `createdAt`),
    INDEX `sales_servedBy_createdAt_idx`(`servedBy`, `createdAt`),
    INDEX `sales_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `sales_clientId_createdAt_idx`(`clientId`, `createdAt`),
    INDEX `sales_createdAt_idx`(`createdAt`),
    INDEX `sales_total_idx`(`total`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SaleTimeLine` (
    `id` VARCHAR(191) NOT NULL,
    `saleId` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sale_payment_transaction_history` (
    `id` VARCHAR(191) NOT NULL,
    `transaction_uuid` VARCHAR(191) NOT NULL,
    `transaction_reference` VARCHAR(191) NOT NULL,
    `provider_transaction_id` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `amount_formatted` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'UGX',
    `provider` VARCHAR(191) NULL,
    `provider_mode` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `event_type` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `notes` TEXT NULL,
    `cashierId` VARCHAR(191) NULL,
    `webhook_received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `webhook_payload` JSON NULL,
    `transaction_initiated_at` DATETIME(3) NULL,
    `transaction_completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sale_payment_transaction_history_transaction_uuid_key`(`transaction_uuid`),
    UNIQUE INDEX `sale_payment_transaction_history_transaction_reference_key`(`transaction_reference`),
    UNIQUE INDEX `sale_payment_transaction_history_provider_transaction_id_key`(`provider_transaction_id`),
    INDEX `sale_payment_transaction_history_transaction_uuid_idx`(`transaction_uuid`),
    INDEX `sale_payment_transaction_history_transaction_reference_idx`(`transaction_reference`),
    INDEX `sale_payment_transaction_history_provider_transaction_id_idx`(`provider_transaction_id`),
    INDEX `sale_payment_transaction_history_provider_idx`(`provider`),
    INDEX `sale_payment_transaction_history_phone_number_idx`(`phone_number`),
    INDEX `sale_payment_transaction_history_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_servedBy_fkey` FOREIGN KEY (`servedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_salePaymentId_fkey` FOREIGN KEY (`salePaymentId`) REFERENCES `sale_payment_transaction_history`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleTimeLine` ADD CONSTRAINT `SaleTimeLine_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_payment_transaction_history` ADD CONSTRAINT `sale_payment_transaction_history_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
