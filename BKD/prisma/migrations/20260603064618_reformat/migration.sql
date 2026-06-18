/*
  Warnings:

  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PaymentMethod` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Supplier` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Supply` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SupplyPayments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isForTickets` on the `Wallet` table. All the data in the column will be lost.
  - The primary key for the `branch_expenses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `branches` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `departments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `inventory_records` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `item_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `product_inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `stores` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `units` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `SeedlingBatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeedlingBatchTracker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeedlingDeath` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeedlingStages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TicketScan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_participants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ticket_payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tickets` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `manufacturingCountryId` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `SeedlingBatch` DROP FOREIGN KEY `SeedlingBatch_currentStageId_fkey`;

-- DropForeignKey
ALTER TABLE `SeedlingBatchTracker` DROP FOREIGN KEY `SeedlingBatchTracker_batchId_fkey`;

-- DropForeignKey
ALTER TABLE `SeedlingBatchTracker` DROP FOREIGN KEY `SeedlingBatchTracker_currentStageId_fkey`;

-- DropForeignKey
ALTER TABLE `SeedlingDeath` DROP FOREIGN KEY `SeedlingDeath_batchId_fkey`;

-- DropForeignKey
ALTER TABLE `SeedlingDeath` DROP FOREIGN KEY `SeedlingDeath_stageId_fkey`;

-- DropForeignKey
ALTER TABLE `Supply` DROP FOREIGN KEY `Supply_destinationStoreId_fkey`;

-- DropForeignKey
ALTER TABLE `Supply` DROP FOREIGN KEY `Supply_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `Supply` DROP FOREIGN KEY `Supply_supplierId_fkey`;

-- DropForeignKey
ALTER TABLE `Supply` DROP FOREIGN KEY `Supply_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `SupplyPayments` DROP FOREIGN KEY `SupplyPayments_supplyId_fkey`;

-- DropForeignKey
ALTER TABLE `TicketScan` DROP FOREIGN KEY `TicketScan_scannedBy_fkey`;

-- DropForeignKey
ALTER TABLE `TicketScan` DROP FOREIGN KEY `TicketScan_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `_PermissionToRole` DROP FOREIGN KEY `_PermissionToRole_A_fkey`;

-- DropForeignKey
ALTER TABLE `_PermissionToRole` DROP FOREIGN KEY `_PermissionToRole_B_fkey`;

-- DropForeignKey
ALTER TABLE `branch_expenses` DROP FOREIGN KEY `branch_expenses_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `departments` DROP FOREIGN KEY `departments_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `employees` DROP FOREIGN KEY `employees_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `employees` DROP FOREIGN KEY `employees_deptId_fkey`;

-- DropForeignKey
ALTER TABLE `employees` DROP FOREIGN KEY `employees_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `event_participants` DROP FOREIGN KEY `event_participants_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `events` DROP FOREIGN KEY `events_walletId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_records` DROP FOREIGN KEY `inventory_records_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_records` DROP FOREIGN KEY `inventory_records_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_records` DROP FOREIGN KEY `inventory_records_toStoreId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_records` DROP FOREIGN KEY `inventory_records_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `product_inventory` DROP FOREIGN KEY `product_inventory_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `product_inventory` DROP FOREIGN KEY `product_inventory_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `product_inventory` DROP FOREIGN KEY `product_inventory_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `sales_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `stores_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `stores_deptId_fkey`;

-- DropForeignKey
ALTER TABLE `ticket_payments` DROP FOREIGN KEY `ticket_payments_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `tickets` DROP FOREIGN KEY `tickets_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `tickets` DROP FOREIGN KEY `tickets_participantId_fkey`;

-- DropIndex
DROP INDEX `Supply_destinationStoreId_fkey` ON `Supply`;

-- DropIndex
DROP INDEX `Supply_itemId_fkey` ON `Supply`;

-- DropIndex
DROP INDEX `Supply_unitId_fkey` ON `Supply`;

-- DropIndex
DROP INDEX `SupplyPayments_supplyId_fkey` ON `SupplyPayments`;

-- DropIndex
DROP INDEX `employees_deptId_fkey` ON `employees`;

-- DropIndex
DROP INDEX `inventory_records_toStoreId_fkey` ON `inventory_records`;

-- DropIndex
DROP INDEX `inventory_records_unitId_fkey` ON `inventory_records`;

-- DropIndex
DROP INDEX `product_inventory_unitId_fkey` ON `product_inventory`;

-- DropIndex
DROP INDEX `stores_deptId_fkey` ON `stores`;

-- AlterTable
ALTER TABLE `Company` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `PaymentMethod` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Supplier` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Supply` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `itemId` VARCHAR(191) NOT NULL,
    MODIFY `supplierId` VARCHAR(191) NOT NULL,
    MODIFY `unitId` VARCHAR(191) NOT NULL,
    MODIFY `destinationStoreId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `SupplyPayments` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `supplyId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Wallet` DROP COLUMN `isForTickets`;

-- AlterTable
ALTER TABLE `_PermissionToRole` MODIFY `A` VARCHAR(191) NOT NULL,
    MODIFY `B` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `branch_expenses` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `branchId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `branches` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `departments` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `branchId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `employees` MODIFY `roleId` VARCHAR(191) NOT NULL,
    MODIFY `branchId` VARCHAR(191) NULL,
    MODIFY `deptId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `inventory_records` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `itemId` VARCHAR(191) NOT NULL,
    MODIFY `storeId` VARCHAR(191) NOT NULL,
    MODIFY `toStoreId` VARCHAR(191) NULL,
    MODIFY `unitId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `item_categories` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `items` DROP PRIMARY KEY,
    ADD COLUMN `manufacturingCountryId` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `categoryId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `permissions` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `product_inventory` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `itemId` VARCHAR(191) NOT NULL,
    MODIFY `storeId` VARCHAR(191) NOT NULL,
    MODIFY `unitId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `roles` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `sales` ADD COLUMN `type` ENUM('IN_SHOP', 'APP') NOT NULL DEFAULT 'IN_SHOP',
    MODIFY `servedBy` VARCHAR(191) NULL,
    MODIFY `storeId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `stores` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `branchId` VARCHAR(191) NOT NULL,
    MODIFY `deptId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `units` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `SeedlingBatch`;

-- DropTable
DROP TABLE `SeedlingBatchTracker`;

-- DropTable
DROP TABLE `SeedlingDeath`;

-- DropTable
DROP TABLE `SeedlingStages`;

-- DropTable
DROP TABLE `TicketScan`;

-- DropTable
DROP TABLE `event_participants`;

-- DropTable
DROP TABLE `events`;

-- DropTable
DROP TABLE `ticket_payments`;

-- DropTable
DROP TABLE `tickets`;

-- CreateTable
CREATE TABLE `ManufacturingCountry` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `item_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_manufacturingCountryId_fkey` FOREIGN KEY (`manufacturingCountryId`) REFERENCES `ManufacturingCountry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_inventory` ADD CONSTRAINT `product_inventory_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_inventory` ADD CONSTRAINT `product_inventory_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_inventory` ADD CONSTRAINT `product_inventory_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_toStoreId_fkey` FOREIGN KEY (`toStoreId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_expenses` ADD CONSTRAINT `branch_expenses_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_destinationStoreId_fkey` FOREIGN KEY (`destinationStoreId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplyPayments` ADD CONSTRAINT `SupplyPayments_supplyId_fkey` FOREIGN KEY (`supplyId`) REFERENCES `Supply`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionToRole` ADD CONSTRAINT `_PermissionToRole_A_fkey` FOREIGN KEY (`A`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionToRole` ADD CONSTRAINT `_PermissionToRole_B_fkey` FOREIGN KEY (`B`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
