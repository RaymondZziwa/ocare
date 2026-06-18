/*
  Warnings:

  - You are about to drop the column `amountPaid` on the `event_participants` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `event_participants` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `event_participants` table. All the data in the column will be lost.
  - Added the required column `reservationCode` to the `event_participants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `event_participants` DROP FOREIGN KEY `event_participants_eventId_fkey`;

-- DropIndex
DROP INDEX `event_participants_eventId_paymentStatus_idx` ON `event_participants`;

-- AlterTable
ALTER TABLE `clients` MODIFY `phone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `event_participants` DROP COLUMN `amountPaid`,
    DROP COLUMN `balance`,
    DROP COLUMN `paymentStatus`,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `reservationCode` VARCHAR(191) NOT NULL,
    MODIFY `tel2` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `tickets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `amountPaid` DECIMAL(10, 2) NOT NULL,
    `balance` DECIMAL(10, 2) NOT NULL,
    `paymentStatus` ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID',
    `ticketcode` CHAR(36) NOT NULL,
    `participantId` INTEGER NOT NULL,
    `numberOfScans` INTEGER NOT NULL DEFAULT 0,
    `lastScannedAt` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'USED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `emailSent` BOOLEAN NOT NULL DEFAULT false,
    `smsSent` BOOLEAN NOT NULL DEFAULT false,
    `ticketSentAt` DATETIME(3) NULL,
    `ticketToken` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tickets_ticketcode_key`(`ticketcode`),
    INDEX `tickets_eventId_idx`(`eventId`),
    INDEX `tickets_participantId_idx`(`participantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TicketScan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `scannedBy` INTEGER NOT NULL,
    `deviceInfo` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TicketScan_ticketId_idx`(`ticketId`),
    INDEX `TicketScan_scannedBy_idx`(`scannedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticket_payments_ticketId_idx`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Withdraw` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DECIMAL(10, 2) NOT NULL,
    `walletId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WithdrawChannel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('BANK_TRANSFER', 'MOBILE_MONEY') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `bank` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wallet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channelId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NULL,
    `balance` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `event_participants_eventId_idx` ON `event_participants`(`eventId`);

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_participantId_fkey` FOREIGN KEY (`participantId`) REFERENCES `event_participants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketScan` ADD CONSTRAINT `TicketScan_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketScan` ADD CONSTRAINT `TicketScan_scannedBy_fkey` FOREIGN KEY (`scannedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_payments` ADD CONSTRAINT `ticket_payments_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Withdraw` ADD CONSTRAINT `Withdraw_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `WithdrawChannel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
