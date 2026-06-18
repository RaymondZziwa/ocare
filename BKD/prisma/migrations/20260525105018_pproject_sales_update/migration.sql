/*
  Warnings:

  - The values [PENDING,FAILED,SUCCESSFUL] on the enum `massage_sales_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `project_sales` MODIFY `status` ENUM('FULLY_PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL;
