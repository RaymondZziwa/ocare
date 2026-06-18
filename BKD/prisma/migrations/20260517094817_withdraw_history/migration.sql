-- CreateTable
CREATE TABLE `WithdrawHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DECIMAL(10, 2) NOT NULL,
    `channelId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WithdrawHistory` ADD CONSTRAINT `WithdrawHistory_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `WithdrawChannel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
