/*
  Warnings:

  - You are about to drop the column `channelId` on the `Wallet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Wallet` DROP FOREIGN KEY `Wallet_channelId_fkey`;

-- DropIndex
DROP INDEX `Wallet_channelId_fkey` ON `Wallet`;

-- AlterTable
ALTER TABLE `Wallet` DROP COLUMN `channelId`,
    ADD COLUMN `canBeDeleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isForTickets` BOOLEAN NOT NULL DEFAULT false;
