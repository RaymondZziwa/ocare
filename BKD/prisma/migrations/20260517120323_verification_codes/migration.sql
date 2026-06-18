/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `WithdrawHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `ChannelVerificationCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channelId` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChannelVerificationCode_channelId_createdAt_idx`(`channelId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `WithdrawHistory_reference_key` ON `WithdrawHistory`(`reference`);

-- AddForeignKey
ALTER TABLE `ChannelVerificationCode` ADD CONSTRAINT `ChannelVerificationCode_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `WithdrawChannel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
