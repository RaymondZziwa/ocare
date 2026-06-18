/*
  Warnings:

  - Added the required column `currency` to the `WithdrawHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `WithdrawHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `WithdrawHistory` ADD COLUMN `currency` VARCHAR(191) NOT NULL,
    ADD COLUMN `reference` VARCHAR(191) NOT NULL;
