/*
  Warnings:

  - The values [FULLY_PAID,UNPAID,PARTIALLY_PAID] on the enum `massage_sales_saleStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [FULLY_PAID,UNPAID,PARTIALLY_PAID] on the enum `massage_sales_saleStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `exhibition_sales` MODIFY `status` ENUM('PENDING', 'FAILED', 'SUCCESSFUL') NOT NULL;

-- AlterTable
ALTER TABLE `massage_sales` ADD COLUMN `saleStatus` ENUM('PENDING', 'FAILED', 'SUCCESSFUL') NOT NULL DEFAULT 'SUCCESSFUL',
    MODIFY `status` ENUM('FULLY_PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL;

-- AlterTable
ALTER TABLE `project_sales` MODIFY `status` ENUM('PENDING', 'FAILED', 'SUCCESSFUL') NOT NULL;

-- AlterTable
ALTER TABLE `sales` ADD COLUMN `saleStatus` ENUM('PENDING', 'FAILED', 'SUCCESSFUL') NOT NULL DEFAULT 'SUCCESSFUL',
    MODIFY `status` ENUM('FULLY_PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL;
