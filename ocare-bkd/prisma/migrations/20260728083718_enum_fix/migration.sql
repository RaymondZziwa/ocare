/*
  Warnings:

  - The values [App] on the enum `sales_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `sales` MODIFY `type` ENUM('In_Shop', 'Mobile', 'Web') NOT NULL DEFAULT 'In_Shop';
