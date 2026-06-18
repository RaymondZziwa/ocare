/*
  Warnings:

  - You are about to drop the column `passowrd` on the `clients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `clients` DROP COLUMN `passowrd`,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `clients_email_key` ON `clients`(`email`);
