/*
  Warnings:

  - The primary key for the `clients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sales` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `salesPayments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `ExhibitionExpenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exhibition_inventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exhibition_inventory_records` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exhibition_sales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exhibition_stores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exhibitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `massageServicePayments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `massage_sales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_sales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dob` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ClientPrescription` DROP FOREIGN KEY `ClientPrescription_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `ExhibitionExpenses` DROP FOREIGN KEY `ExhibitionExpenses_exhibitionId_fkey`;

-- DropForeignKey
ALTER TABLE `exhibition_inventory` DROP FOREIGN KEY `exhibition_inventory_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `exhibition_inventory` DROP FOREIGN KEY `exhibition_inventory_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `exhibition_inventory` DROP FOREIGN KEY `exhibition_inventory_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `exhibition_inventory_records` DROP FOREIGN KEY `exhibition_inventory_records_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `exhibition_inventory_records` DROP FOREIGN KEY `exhibition_inventory_records_recordedBy_fkey`;

-- DropForeignKey
ALTER TABLE `exhibition_inventory_records` DROP FOREIGN KEY `exhibition_inventory_records_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `exhibition_inventory_records` DROP FOREIGN KEY `exhibition_inventory_records_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `exhibition_sales` DROP FOREIGN KEY `exhibition_sales_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `exhibition_sales` DROP FOREIGN KEY `exhibition_sales_exhibitionStoreId_fkey`;

-- DropForeignKey
ALTER TABLE `exhibition_sales` DROP FOREIGN KEY `exhibition_sales_servedBy_fkey`;

-- DropForeignKey
ALTER TABLE `exhibition_stores` DROP FOREIGN KEY `exhibition_stores_exhibitionId_fkey`;

-- DropForeignKey
ALTER TABLE `massageServicePayments` DROP FOREIGN KEY `massageServicePayments_cashierId_fkey`;

-- DropForeignKey
ALTER TABLE `massageServicePayments` DROP FOREIGN KEY `massageServicePayments_saleId_fkey`;

-- DropForeignKey
ALTER TABLE `massage_sales` DROP FOREIGN KEY `massage_sales_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `massage_sales` DROP FOREIGN KEY `massage_sales_servedBy_fkey`;

-- DropForeignKey
ALTER TABLE `project_payments` DROP FOREIGN KEY `project_payments_cashierId_fkey`;

-- DropForeignKey
ALTER TABLE `project_payments` DROP FOREIGN KEY `project_payments_saleId_fkey`;

-- DropForeignKey
ALTER TABLE `project_sales` DROP FOREIGN KEY `project_sales_cashierId_fkey`;

-- DropForeignKey
ALTER TABLE `project_sales` DROP FOREIGN KEY `project_sales_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `project_sales` DROP FOREIGN KEY `project_sales_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `sale_payment_transaction_history` DROP FOREIGN KEY `sale_payment_transaction_history_salePaymentId_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `sales_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `salesPayments` DROP FOREIGN KEY `salesPayments_saleId_fkey`;

-- DropIndex
DROP INDEX `ClientPrescription_clientId_fkey` ON `ClientPrescription`;

-- DropIndex
DROP INDEX `salesPayments_saleId_fkey` ON `salesPayments`;

-- AlterTable
ALTER TABLE `ClientPrescription` MODIFY `clientId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `clients` DROP PRIMARY KEY,
    ADD COLUMN `dob` DATETIME(3) NOT NULL,
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    ADD COLUMN `profileImage` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `sale_payment_transaction_history` MODIFY `salePaymentId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `sales` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `clientId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `salesPayments` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `saleId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `ExhibitionExpenses`;

-- DropTable
DROP TABLE `exhibition_inventory`;

-- DropTable
DROP TABLE `exhibition_inventory_records`;

-- DropTable
DROP TABLE `exhibition_sales`;

-- DropTable
DROP TABLE `exhibition_stores`;

-- DropTable
DROP TABLE `exhibitions`;

-- DropTable
DROP TABLE `massageServicePayments`;

-- DropTable
DROP TABLE `massage_sales`;

-- DropTable
DROP TABLE `project_payments`;

-- DropTable
DROP TABLE `project_sales`;

-- DropTable
DROP TABLE `projects`;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salesPayments` ADD CONSTRAINT `salesPayments_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_payment_transaction_history` ADD CONSTRAINT `sale_payment_transaction_history_salePaymentId_fkey` FOREIGN KEY (`salePaymentId`) REFERENCES `salesPayments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientPrescription` ADD CONSTRAINT `ClientPrescription_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
