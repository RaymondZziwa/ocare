/*
  Warnings:

  - Added the required column `mode` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SaleItem` ADD COLUMN `mode` ENUM('Retail', 'Wholesale') NOT NULL;
