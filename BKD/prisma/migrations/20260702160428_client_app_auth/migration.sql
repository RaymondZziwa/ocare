/*
  Warnings:

  - You are about to drop the column `address` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `dob` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `pin` on the `clients` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `clients_firstName_lastName_idx` ON `clients`;

-- AlterTable
ALTER TABLE `clients` DROP COLUMN `address`,
    DROP COLUMN `dob`,
    DROP COLUMN `firstName`,
    DROP COLUMN `gender`,
    DROP COLUMN `lastName`,
    DROP COLUMN `pin`,
    ADD COLUMN `fullName` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `clients_fullName_idx` ON `clients`(`fullName`);
