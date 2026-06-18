/*
  Warnings:

  - You are about to drop the `banks` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `stores` ADD COLUMN `isForSales` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `banks`;
