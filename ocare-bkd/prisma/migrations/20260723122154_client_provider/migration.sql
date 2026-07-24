/*
  Warnings:

  - Added the required column `provider` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `clients` ADD COLUMN `provider` ENUM('Web', 'Google', 'Mobile', 'In_Shop') NOT NULL;
