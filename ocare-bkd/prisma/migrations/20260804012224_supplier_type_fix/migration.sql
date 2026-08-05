/*
  Warnings:

  - The values [BUSINESSS] on the enum `Supplier_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Supplier` MODIFY `type` ENUM('INDIVIDUAL', 'BUSINESS') NOT NULL DEFAULT 'INDIVIDUAL';
