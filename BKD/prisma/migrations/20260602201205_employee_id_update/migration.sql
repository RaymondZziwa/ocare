/*
  Warnings:

  - The primary key for the `email_verifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `employees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `manufacturing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Attendance` DROP FOREIGN KEY `Attendance_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `ClientPrescription` DROP FOREIGN KEY `ClientPrescription_prescribedBy_fkey`;

-- DropForeignKey
ALTER TABLE `DeliveryNote` DROP FOREIGN KEY `DeliveryNote_registeredBy_fkey`;

-- DropForeignKey
ALTER TABLE `Supply` DROP FOREIGN KEY `Supply_recievedBy_fkey`;

-- DropForeignKey
ALTER TABLE `SupplyPayments` DROP FOREIGN KEY `SupplyPayments_paidBy_fkey`;

-- DropForeignKey
ALTER TABLE `TicketScan` DROP FOREIGN KEY `TicketScan_scannedBy_fkey`;

-- DropForeignKey
ALTER TABLE `branch_expenses` DROP FOREIGN KEY `branch_expenses_recordedBy_fkey`;

-- DropForeignKey
ALTER TABLE `email_verifications` DROP FOREIGN KEY `email_verifications_userId_fkey`;

-- DropForeignKey
ALTER TABLE `employee_login_logs` DROP FOREIGN KEY `employee_login_logs_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_records` DROP FOREIGN KEY `inventory_records_recordedBy_fkey`;

-- DropForeignKey
ALTER TABLE `manufacturing` DROP FOREIGN KEY `manufacturing_manufacturedBy_fkey`;

-- DropForeignKey
ALTER TABLE `manufacturing` DROP FOREIGN KEY `manufacturing_primaryUnitId_fkey`;

-- DropForeignKey
ALTER TABLE `manufacturing` DROP FOREIGN KEY `manufacturing_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `manufacturing` DROP FOREIGN KEY `manufacturing_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `sale_payment_transaction_history` DROP FOREIGN KEY `sale_payment_transaction_history_cashierId_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `sales_servedBy_fkey`;

-- DropForeignKey
ALTER TABLE `salesPayments` DROP FOREIGN KEY `salesPayments_cashierId_fkey`;

-- DropIndex
DROP INDEX `Attendance_employeeId_fkey` ON `Attendance`;

-- DropIndex
DROP INDEX `ClientPrescription_prescribedBy_fkey` ON `ClientPrescription`;

-- DropIndex
DROP INDEX `DeliveryNote_registeredBy_fkey` ON `DeliveryNote`;

-- DropIndex
DROP INDEX `Supply_recievedBy_fkey` ON `Supply`;

-- DropIndex
DROP INDEX `SupplyPayments_paidBy_fkey` ON `SupplyPayments`;

-- DropIndex
DROP INDEX `branch_expenses_recordedBy_fkey` ON `branch_expenses`;

-- DropIndex
DROP INDEX `sale_payment_transaction_history_cashierId_fkey` ON `sale_payment_transaction_history`;

-- DropIndex
DROP INDEX `salesPayments_cashierId_fkey` ON `salesPayments`;

-- AlterTable
ALTER TABLE `Attendance` MODIFY `employeeId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ClientPrescription` MODIFY `prescribedBy` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `DeliveryNote` MODIFY `registeredBy` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Supply` MODIFY `recievedBy` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `SupplyPayments` MODIFY `paidBy` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `TicketScan` MODIFY `scannedBy` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `branch_expenses` MODIFY `recordedBy` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `email_verifications` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `employee_login_logs` MODIFY `employeeId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `employees` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `inventory_records` MODIFY `recordedBy` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `sale_payment_transaction_history` MODIFY `cashierId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `sales` MODIFY `servedBy` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `salesPayments` MODIFY `cashierId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `manufacturing`;

-- AddForeignKey
ALTER TABLE `employee_login_logs` ADD CONSTRAINT `employee_login_logs_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_verifications` ADD CONSTRAINT `email_verifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_servedBy_fkey` FOREIGN KEY (`servedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salesPayments` ADD CONSTRAINT `salesPayments_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_payment_transaction_history` ADD CONSTRAINT `sale_payment_transaction_history_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketScan` ADD CONSTRAINT `TicketScan_scannedBy_fkey` FOREIGN KEY (`scannedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_expenses` ADD CONSTRAINT `branch_expenses_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientPrescription` ADD CONSTRAINT `ClientPrescription_prescribedBy_fkey` FOREIGN KEY (`prescribedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryNote` ADD CONSTRAINT `DeliveryNote_registeredBy_fkey` FOREIGN KEY (`registeredBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_recievedBy_fkey` FOREIGN KEY (`recievedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplyPayments` ADD CONSTRAINT `SupplyPayments_paidBy_fkey` FOREIGN KEY (`paidBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
