/*
  Warnings:

  - You are about to drop the `WithdrawHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `WithdrawHistory` DROP FOREIGN KEY `WithdrawHistory_channelId_fkey`;

-- AlterTable
ALTER TABLE `Withdraw` MODIFY `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL;

-- DropTable
DROP TABLE `WithdrawHistory`;

-- CreateTable
CREATE TABLE `sale_payment_transaction_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `salePaymentId` INTEGER NOT NULL,
    `transaction_uuid` VARCHAR(191) NOT NULL,
    `transaction_reference` VARCHAR(191) NOT NULL,
    `provider_transaction_id` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `amount_formatted` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'UGX',
    `payment_method` ENUM('CASH', 'MTN_MOMO', 'AIRTEL_MOMO', 'CARD', 'PROF_MOMO') NOT NULL,
    `provider` VARCHAR(191) NULL,
    `provider_mode` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `event_type` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `notes` TEXT NULL,
    `cashierId` INTEGER NOT NULL,
    `webhook_received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `webhook_payload` JSON NULL,
    `transaction_initiated_at` DATETIME(3) NULL,
    `transaction_completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sale_payment_transaction_history_transaction_uuid_key`(`transaction_uuid`),
    UNIQUE INDEX `sale_payment_transaction_history_transaction_reference_key`(`transaction_reference`),
    UNIQUE INDEX `sale_payment_transaction_history_provider_transaction_id_key`(`provider_transaction_id`),
    INDEX `sale_payment_transaction_history_salePaymentId_idx`(`salePaymentId`),
    INDEX `sale_payment_transaction_history_transaction_uuid_idx`(`transaction_uuid`),
    INDEX `sale_payment_transaction_history_transaction_reference_idx`(`transaction_reference`),
    INDEX `sale_payment_transaction_history_provider_transaction_id_idx`(`provider_transaction_id`),
    INDEX `sale_payment_transaction_history_provider_idx`(`provider`),
    INDEX `sale_payment_transaction_history_phone_number_idx`(`phone_number`),
    INDEX `sale_payment_transaction_history_created_at_idx`(`created_at`),
    INDEX `sale_payment_transaction_history_payment_method_idx`(`payment_method`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'SALE_PAYMENT', 'REFUND') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `channelId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL,
    `description` TEXT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL,
    `statusUpdatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TransactionHistory_reference_key`(`reference`),
    UNIQUE INDEX `TransactionHistory_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sale_payment_transaction_history` ADD CONSTRAINT `sale_payment_transaction_history_salePaymentId_fkey` FOREIGN KEY (`salePaymentId`) REFERENCES `salesPayments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_payment_transaction_history` ADD CONSTRAINT `sale_payment_transaction_history_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionHistory` ADD CONSTRAINT `TransactionHistory_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `WithdrawChannel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
