-- AlterTable
ALTER TABLE `ticket_payments` ADD COLUMN `paymentStatus` ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID';
