/*
  Warnings:

  - You are about to drop the column `salePaymentId` on the `sales` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `sales_salePaymentId_fkey`;

-- DropIndex
DROP INDEX `sales_salePaymentId_key` ON `sales`;

-- AlterTable
ALTER TABLE `sales` DROP COLUMN `salePaymentId`;
