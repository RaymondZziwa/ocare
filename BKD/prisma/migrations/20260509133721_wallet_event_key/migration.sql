/*
  Warnings:

  - Added the required column `walletId` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `events` ADD COLUMN `walletId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
