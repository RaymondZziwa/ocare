-- CreateTable
CREATE TABLE `billing_channels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `utility` ENUM('LIGHT', 'NWSC') NOT NULL,
    `name` VARCHAR(191) NULL,
    `meterNumber` VARCHAR(191) NOT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `area` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `billing_channels_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
