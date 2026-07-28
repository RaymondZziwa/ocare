-- CreateTable
CREATE TABLE `branch_expenses` (
    `id` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `category` ENUM('RENT', 'UTILITIES', 'SALARIES', 'SUPPLIES', 'MAINTENANCE', 'TRANSPORT', 'INSURANCE', 'MARKETING', 'TRAINING', 'TAXES', 'MEDICAL_SUPPLIES', 'OFFICE_SUPPLIES', 'EQUIPMENT_PURCHASE', 'EQUIPMENT_REPAIR', 'CLEANING', 'SECURITY', 'INTERNET', 'WATER', 'ELECTRICITY', 'COMMUNICATION', 'SOFTWARE_SUBSCRIPTIONS', 'MISCELLANEOUS') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `receiptImage` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `dateIncurred` DATETIME(3) NOT NULL,
    `recordedBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `branch_expenses_branchId_dateIncurred_idx`(`branchId`, `dateIncurred`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `branch_expenses` ADD CONSTRAINT `branch_expenses_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_expenses` ADD CONSTRAINT `branch_expenses_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
