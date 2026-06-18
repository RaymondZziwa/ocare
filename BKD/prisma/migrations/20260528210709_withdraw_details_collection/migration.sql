/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `WithdrawHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `WithdrawHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `WithdrawHistory` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `reference` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `WithdrawHistory_reference_key` ON `WithdrawHistory`(`reference`);
