-- AlterTable
ALTER TABLE `Wallet` ADD COLUMN `isForAppSales` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `stores` ADD COLUMN `isForAppSales` BOOLEAN NOT NULL DEFAULT false;
