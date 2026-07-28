/*
  Warnings:

  - You are about to drop the column `paymentMethods` on the `sales` table. All the data in the column will be lost.
  - Added the required column `paymentMethod` to the `sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sales` DROP COLUMN `paymentMethods`,
    ADD COLUMN `paymentMethod` VARCHAR(191) NOT NULL;
