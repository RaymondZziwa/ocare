/*
  Warnings:

  - You are about to drop the `_SaleItemToShopSale` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `SaleItem` DROP FOREIGN KEY `SaleItem_saleId_fkey`;

-- DropForeignKey
ALTER TABLE `_SaleItemToShopSale` DROP FOREIGN KEY `_SaleItemToShopSale_A_fkey`;

-- DropForeignKey
ALTER TABLE `_SaleItemToShopSale` DROP FOREIGN KEY `_SaleItemToShopSale_B_fkey`;

-- DropTable
DROP TABLE `_SaleItemToShopSale`;

-- AddForeignKey
ALTER TABLE `SaleItem` ADD CONSTRAINT `SaleItem_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `ShopSale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
