-- AlterTable
ALTER TABLE `WithdrawChannel` ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `WithdrawHistory` ADD COLUMN `description` TEXT NULL;
