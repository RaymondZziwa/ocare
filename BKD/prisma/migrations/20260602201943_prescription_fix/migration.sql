/*
  Warnings:

  - The primary key for the `ClientPrescription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `passowrd` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ClientPrescription` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `clients` ADD COLUMN `passowrd` VARCHAR(191) NOT NULL,
    ADD COLUMN `pin` VARCHAR(191) NULL;
