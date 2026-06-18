/*
  Warnings:

  - You are about to drop the `cheques` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `cheques` DROP FOREIGN KEY `cheques_bankId_fkey`;

-- AlterTable
ALTER TABLE `sales` MODIFY `saleStatus` ENUM('PENDING', 'FAILED', 'IN_DELIVERY', 'CANCELLED', 'SUCCESSFUL') NOT NULL DEFAULT 'SUCCESSFUL';

-- DropTable
DROP TABLE `cheques`;

-- CreateTable
CREATE TABLE `DeliveryAgents` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `licensePlate` VARCHAR(191) NULL,
    `status` ENUM('OCCUPIED', 'AVAILABLE', 'UNAVAILABLE') NOT NULL DEFAULT 'UNAVAILABLE',
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
