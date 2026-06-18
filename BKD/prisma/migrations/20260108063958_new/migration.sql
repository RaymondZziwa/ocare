/*
  Warnings:

  - You are about to drop the column `contact` on the `clients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `clients_contact_idx` ON `clients`;

-- DropIndex
DROP INDEX `clients_contact_key` ON `clients`;

-- AlterTable
ALTER TABLE `clients` DROP COLUMN `contact`,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `clients_phone_key` ON `clients`(`phone`);

-- CreateIndex
CREATE INDEX `clients_phone_idx` ON `clients`(`phone`);
