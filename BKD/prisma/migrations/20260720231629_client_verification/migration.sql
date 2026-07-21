-- AlterTable
ALTER TABLE `ClientPrescription` MODIFY `prescribedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `clients` ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isPhoneVerified` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `sales` MODIFY `type` ENUM('IN_SHOP', 'APP', 'WEB') NOT NULL DEFAULT 'IN_SHOP';
