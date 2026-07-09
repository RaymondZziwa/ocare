/*
  Warnings:

  - Added the required column `firstName` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `clients_fullName_idx` ON `clients`;

-- AlterTable
ALTER TABLE `clients` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `dob` DATETIME(3) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE') NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `pin` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `clients_firstName_lastName_idx` ON `clients`(`firstName`, `lastName`);
