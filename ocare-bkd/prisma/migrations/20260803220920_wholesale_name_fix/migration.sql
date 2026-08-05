/*
  Warnings:

  - You are about to drop the column `wholeSalePrice` on the `items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `items` DROP COLUMN `wholeSalePrice`,
    ADD COLUMN `wholesalePrice` DECIMAL(10, 2) NOT NULL DEFAULT 0.0;
