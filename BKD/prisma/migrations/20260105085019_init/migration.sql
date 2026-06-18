-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `tel1` VARCHAR(191) NOT NULL,
    `tel2` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `tinNumber` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `foundedYear` INTEGER NULL,
    `industry` VARCHAR(191) NULL,
    `employees` VARCHAR(191) NULL,
    `workHours` DOUBLE NULL DEFAULT 8.0,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Company_email_idx`(`email`),
    INDEX `Company_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentMethod` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PaymentMethod_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `branchId` INTEGER NOT NULL,
    `deptId` INTEGER NOT NULL,
    `authorizedPersonnel` JSON NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stores_branchId_deptId_idx`(`branchId`, `deptId`),
    INDEX `stores_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `value` DOUBLE NULL,
    `abr` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `units_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `branches_name_location_idx`(`name`, `location`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `branchId` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `departments_branchId_idx`(`branchId`),
    INDEX `departments_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `module` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissions_value_key`(`value`),
    INDEX `permissions_module_name_idx`(`module`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `tel` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `salary` DECIMAL(10, 2) NOT NULL,
    `hasAccess` BOOLEAN NOT NULL DEFAULT false,
    `hasPrescriptionAccess` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `profileImage` VARCHAR(191) NULL,
    `roleId` INTEGER NOT NULL,
    `branchId` INTEGER NULL,
    `deptId` INTEGER NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `employees_email_key`(`email`),
    UNIQUE INDEX `employees_tel_key`(`tel`),
    INDEX `employees_email_isActive_idx`(`email`, `isActive`),
    INDEX `employees_roleId_idx`(`roleId`),
    INDEX `employees_branchId_deptId_idx`(`branchId`, `deptId`),
    INDEX `employees_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_login_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `employee_login_logs_employeeId_createdAt_idx`(`employeeId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_verifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    INDEX `email_verifications_expiresAt_idx`(`expiresAt`),
    UNIQUE INDEX `email_verifications_userId_code_key`(`userId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `item_categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryId` INTEGER NULL,
    `showInPos` BOOLEAN NOT NULL DEFAULT false,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `items_categoryId_idx`(`categoryId`),
    INDEX `items_name_idx`(`name`),
    INDEX `items_barcode_idx`(`barcode`),
    INDEX `items_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `services_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `qty` DOUBLE NOT NULL,
    `unitId` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `product_inventory_storeId_itemId_idx`(`storeId`, `itemId`),
    INDEX `product_inventory_qty_idx`(`qty`),
    UNIQUE INDEX `product_inventory_itemId_storeId_unitId_key`(`itemId`, `storeId`, `unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` ENUM('RESTOCK', 'DEPLETION', 'TRANSFER', 'ADJUSTMENT', 'MANUFACTURING') NOT NULL,
    `itemId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `toStoreId` INTEGER NULL,
    `deliveryNoteId` INTEGER NULL,
    `initiatedQty` DOUBLE NULL,
    `qty` DOUBLE NOT NULL,
    `remainingQuantity` DOUBLE NULL,
    `unitId` INTEGER NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `recordedBy` INTEGER NOT NULL,
    `transferId` VARCHAR(191) NULL,
    `transferStatus` ENUM('CONFIRMED', 'PENDING', 'REJECTED') NOT NULL DEFAULT 'CONFIRMED',
    `isResolved` BOOLEAN NULL,
    `resolveNotes` VARCHAR(191) NULL,
    `images` JSON NULL,
    `extraNote` VARCHAR(191) NULL,
    `expectedOutput` DOUBLE NULL,
    `recordedOutput` DOUBLE NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inventory_records_storeId_createdAt_idx`(`storeId`, `createdAt`),
    INDEX `inventory_records_itemId_createdAt_idx`(`itemId`, `createdAt`),
    INDEX `inventory_records_category_createdAt_idx`(`category`, `createdAt`),
    INDEX `inventory_records_recordedBy_createdAt_idx`(`recordedBy`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NULL,
    `items` JSON NOT NULL,
    `servedBy` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `status` ENUM('FULLY_PAID', 'UNPAID', 'PARTIALLY_PAID') NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `balance` DECIMAL(10, 2) NOT NULL,
    `paymentMethods` JSON NOT NULL,
    `notes` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sales_storeId_createdAt_idx`(`storeId`, `createdAt`),
    INDEX `sales_servedBy_createdAt_idx`(`servedBy`, `createdAt`),
    INDEX `sales_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `sales_clientId_createdAt_idx`(`clientId`, `createdAt`),
    INDEX `sales_createdAt_idx`(`createdAt`),
    INDEX `sales_total_idx`(`total`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salesPayments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` ENUM('CASH', 'MTN_MOMO', 'AIRTEL_MOMO', 'CARD', 'PROF_MOMO') NOT NULL,
    `referenceId` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `cashierId` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `salesPayments_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `clients_contact_key`(`contact`),
    INDEX `clients_firstName_lastName_idx`(`firstName`, `lastName`),
    INDEX `clients_contact_idx`(`contact`),
    INDEX `clients_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `ticketPrice` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `location` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `events_startDate_endDate_idx`(`startDate`, `endDate`),
    INDEX `events_status_idx`(`status`),
    INDEX `events_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_participants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `tel` VARCHAR(191) NOT NULL,
    `tel2` VARCHAR(191) NOT NULL,
    `amountPaid` DECIMAL(10, 2) NOT NULL,
    `balance` DECIMAL(10, 2) NOT NULL,
    `paymentStatus` ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID',
    `eventId` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `event_participants_eventId_paymentStatus_idx`(`eventId`, `paymentStatus`),
    INDEX `event_participants_tel_idx`(`tel`),
    INDEX `event_participants_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exhibitions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `exhibitions_startDate_endDate_idx`(`startDate`, `endDate`),
    INDEX `exhibitions_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exhibition_stores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `exhibitionId` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `exhibition_stores_exhibitionId_idx`(`exhibitionId`),
    UNIQUE INDEX `exhibition_stores_exhibitionId_name_key`(`exhibitionId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exhibition_inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` ENUM('RESTOCK', 'DEPLETION', 'TRANSFER', 'ADJUSTMENT', 'MANUFACTURING') NOT NULL,
    `storeId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `qty` DOUBLE NOT NULL,
    `unitId` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `exhibition_inventory_storeId_idx`(`storeId`),
    UNIQUE INDEX `exhibition_inventory_storeId_itemId_unitId_key`(`storeId`, `itemId`, `unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exhibition_inventory_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `category` ENUM('RESTOCK', 'DEPLETION', 'TRANSFER', 'ADJUSTMENT', 'MANUFACTURING') NOT NULL,
    `itemId` INTEGER NOT NULL,
    `qty` DOUBLE NOT NULL,
    `unitId` INTEGER NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `recordedBy` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `exhibition_inventory_records_storeId_createdAt_idx`(`storeId`, `createdAt`),
    INDEX `exhibition_inventory_records_recordedBy_createdAt_idx`(`recordedBy`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exhibition_sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `items` JSON NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('FULLY_PAID', 'UNPAID', 'PARTIALLY_PAID') NOT NULL,
    `balance` DECIMAL(10, 2) NOT NULL,
    `paymentMethods` JSON NOT NULL,
    `notes` VARCHAR(191) NULL,
    `exhibitionStoreId` INTEGER NOT NULL,
    `servedBy` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `exhibition_sales_servedBy_createdAt_idx`(`servedBy`, `createdAt`),
    INDEX `exhibition_sales_clientId_idx`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExhibitionExpenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` ENUM('RENT', 'UTILITIES', 'SALARIES', 'SUPPLIES', 'MAINTENANCE', 'TRANSPORT', 'INSURANCE', 'MARKETING', 'TRAINING', 'TAXES', 'MEDICAL_SUPPLIES', 'OFFICE_SUPPLIES', 'EQUIPMENT_PURCHASE', 'EQUIPMENT_REPAIR', 'CLEANING', 'SECURITY', 'INTERNET', 'WATER', 'ELECTRICITY', 'COMMUNICATION', 'SOFTWARE_SUBSCRIPTIONS', 'MISCELLANEOUS') NOT NULL,
    `exhibitionId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `dateIncurred` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `projects_name_idx`(`name`),
    INDEX `projects_barcode_idx`(`barcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `projectId` INTEGER NOT NULL,
    `status` ENUM('FULLY_PAID', 'UNPAID', 'PARTIALLY_PAID') NOT NULL,
    `saleTotal` DECIMAL(10, 2) NOT NULL,
    `downPayment` DECIMAL(10, 2) NOT NULL,
    `numberOfInstallments` INTEGER NOT NULL,
    `installmentAmount` DECIMAL(10, 2) NOT NULL,
    `deliveryNoteImage` VARCHAR(191) NULL,
    `cashierId` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `project_sales_clientId_idx`(`clientId`),
    INDEX `project_sales_cashierId_createdAt_idx`(`cashierId`, `createdAt`),
    INDEX `project_sales_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `exhibitionId` INTEGER NOT NULL,
    `paymentMethod` ENUM('CASH', 'MTN_MOMO', 'AIRTEL_MOMO', 'CARD', 'PROF_MOMO') NOT NULL,
    `referenceId` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `receiptImage` VARCHAR(191) NULL,
    `bankDepositSlipImage` VARCHAR(191) NULL,
    `cashierId` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `project_payments_saleId_createdAt_idx`(`saleId`, `createdAt`),
    INDEX `project_payments_cashierId_createdAt_idx`(`cashierId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NULL,
    `balance` DECIMAL(10, 2) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `banks_accountNumber_idx`(`accountNumber`),
    UNIQUE INDEX `banks_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cheques` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chequeNumber` VARCHAR(191) NOT NULL,
    `bankId` INTEGER NOT NULL,
    `DraweeFirstName` VARCHAR(191) NOT NULL,
    `DraweeLastName` VARCHAR(191) NULL,
    `contact` VARCHAR(191) NULL,
    `Address` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'BOUNCED') NOT NULL DEFAULT 'PENDING',
    `bankingDate` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cheques_bankId_status_idx`(`bankId`, `status`),
    INDEX `cheques_chequeNumber_idx`(`chequeNumber`),
    INDEX `cheques_bankingDate_idx`(`bankingDate`),
    INDEX `cheques_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branch_expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `category` ENUM('RENT', 'UTILITIES', 'SALARIES', 'SUPPLIES', 'MAINTENANCE', 'TRANSPORT', 'INSURANCE', 'MARKETING', 'TRAINING', 'TAXES', 'MEDICAL_SUPPLIES', 'OFFICE_SUPPLIES', 'EQUIPMENT_PURCHASE', 'EQUIPMENT_REPAIR', 'CLEANING', 'SECURITY', 'INTERNET', 'WATER', 'ELECTRICITY', 'COMMUNICATION', 'SOFTWARE_SUBSCRIPTIONS', 'MISCELLANEOUS') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `receiptImage` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `dateIncurred` DATETIME(3) NOT NULL,
    `recordedBy` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `branch_expenses_branchId_dateIncurred_idx`(`branchId`, `dateIncurred`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `massage_sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `items` JSON NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('FULLY_PAID', 'UNPAID', 'PARTIALLY_PAID') NOT NULL,
    `balance` DECIMAL(10, 2) NOT NULL,
    `paymentMethods` JSON NOT NULL,
    `notes` VARCHAR(191) NULL,
    `servedBy` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `massage_sales_createdAt_idx`(`createdAt`),
    INDEX `massage_sales_clientId_idx`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `massageServicePayments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` ENUM('CASH', 'MTN_MOMO', 'AIRTEL_MOMO', 'CARD', 'PROF_MOMO') NOT NULL,
    `referenceId` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `cashierId` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `massageServicePayments_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` VARCHAR(191) NOT NULL,
    `employeeId` INTEGER NOT NULL,
    `timeIn` DATETIME(3) NOT NULL,
    `timeOut` DATETIME(3) NULL,
    `missedHours` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayrollPeriods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `payDate` DATETIME(3) NOT NULL,
    `totalSpent` DECIMAL(65, 30) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payroll` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payrollPeriodId` INTEGER NOT NULL,
    `paymentStructure` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientPrescription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `images` JSON NOT NULL,
    `notes` VARCHAR(191) NULL,
    `prescribedBy` INTEGER NOT NULL,
    `isReviewed` BOOLEAN NOT NULL DEFAULT false,
    `reviewNotes` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryNote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `deliveryNoteNumber` VARCHAR(191) NOT NULL,
    `images` JSON NOT NULL,
    `registeredBy` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Supplier_contact_key`(`contact`),
    INDEX `Supplier_firstName_lastName_idx`(`firstName`, `lastName`),
    INDEX `Supplier_contact_idx`(`contact`),
    INDEX `Supplier_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supply` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemId` INTEGER NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `qty` DOUBLE NOT NULL,
    `unitId` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `balance` DECIMAL(10, 2) NOT NULL,
    `recievedBy` INTEGER NOT NULL,
    `paymentStatus` ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID',
    `proofImage` VARCHAR(191) NULL,
    `destinationStoreId` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Supply_supplierId_idx`(`supplierId`),
    INDEX `Supply_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupplyPayments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplyId` INTEGER NOT NULL,
    `bank` VARCHAR(191) NULL,
    `chequeNumber` VARCHAR(191) NULL,
    `chequeBankingDate` DATETIME(3) NULL,
    `paymentType` ENUM('CASH', 'CHEQUE', 'MOBILE_MONEY', 'BARTER_PAYMENT') NOT NULL,
    `barterItemName` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paidBy` INTEGER NOT NULL,
    `paymentStatus` ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL,
    `proofImage` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeedlingStages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `stageDays` DOUBLE NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SeedlingStages_name_idx`(`name`),
    INDEX `SeedlingStages_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeedlingBatch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batchNumber` VARCHAR(191) NOT NULL,
    `currentStageId` INTEGER NOT NULL,
    `seedlings` JSON NOT NULL,
    `daysSpentInCurrentStage` DOUBLE NOT NULL,
    `status` ENUM('IN_PROGRESS', 'COMPLETED', 'FAILED') NOT NULL,
    `notes` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeedlingBatchTracker` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batchId` INTEGER NOT NULL,
    `currentStageId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `seedlingsLostAtCurrentStage` JSON NULL,
    `daysToNextStage` DOUBLE NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeedlingDeath` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batchId` INTEGER NOT NULL,
    `stageId` INTEGER NOT NULL,
    `seedlings` JSON NOT NULL,
    `reason` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manufacturing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `primaryUnitId` INTEGER NOT NULL,
    `unitId` INTEGER NOT NULL,
    `totalQuantity` DOUBLE NOT NULL,
    `estimatedOutput` DOUBLE NOT NULL,
    `actualOutput` DOUBLE NULL,
    `status` ENUM('PENDING', 'NORMAL', 'WASTAGE_DETECTED', 'GOOD_UTILIZATION') NOT NULL DEFAULT 'PENDING',
    `items` JSON NOT NULL,
    `manufacturedBy` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `manufacturing_storeId_createdAt_idx`(`storeId`, `createdAt`),
    INDEX `manufacturing_manufacturedBy_createdAt_idx`(`manufacturedBy`, `createdAt`),
    INDEX `manufacturing_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `manufacturing_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PermissionToRole` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PermissionToRole_AB_unique`(`A`, `B`),
    INDEX `_PermissionToRole_B_index`(`B`)
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
ALTER TABLE `employee_login_logs` ADD CONSTRAINT `employee_login_logs_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_verifications` ADD CONSTRAINT `email_verifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `item_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_deliveryNoteId_fkey` FOREIGN KEY (`deliveryNoteId`) REFERENCES `DeliveryNote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_records` ADD CONSTRAINT `inventory_records_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_servedBy_fkey` FOREIGN KEY (`servedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salesPayments` ADD CONSTRAINT `salesPayments_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salesPayments` ADD CONSTRAINT `salesPayments_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_participants` ADD CONSTRAINT `event_participants_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exhibition_stores` ADD CONSTRAINT `exhibition_stores_exhibitionId_fkey` FOREIGN KEY (`exhibitionId`) REFERENCES `exhibitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exhibition_inventory` ADD CONSTRAINT `exhibition_inventory_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `exhibition_stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exhibition_inventory` ADD CONSTRAINT `exhibition_inventory_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exhibition_inventory` ADD CONSTRAINT `exhibition_inventory_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exhibition_inventory_records` ADD CONSTRAINT `exhibition_inventory_records_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `exhibition_stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exhibition_inventory_records` ADD CONSTRAINT `exhibition_inventory_records_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exhibition_inventory_records` ADD CONSTRAINT `exhibition_inventory_records_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exhibition_inventory_records` ADD CONSTRAINT `exhibition_inventory_records_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exhibition_sales` ADD CONSTRAINT `exhibition_sales_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exhibition_sales` ADD CONSTRAINT `exhibition_sales_exhibitionStoreId_fkey` FOREIGN KEY (`exhibitionStoreId`) REFERENCES `exhibition_stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exhibition_sales` ADD CONSTRAINT `exhibition_sales_servedBy_fkey` FOREIGN KEY (`servedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExhibitionExpenses` ADD CONSTRAINT `ExhibitionExpenses_exhibitionId_fkey` FOREIGN KEY (`exhibitionId`) REFERENCES `exhibitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_sales` ADD CONSTRAINT `project_sales_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_sales` ADD CONSTRAINT `project_sales_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_sales` ADD CONSTRAINT `project_sales_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_payments` ADD CONSTRAINT `project_payments_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `project_sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_payments` ADD CONSTRAINT `project_payments_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cheques` ADD CONSTRAINT `cheques_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `banks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_expenses` ADD CONSTRAINT `branch_expenses_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_expenses` ADD CONSTRAINT `branch_expenses_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `massage_sales` ADD CONSTRAINT `massage_sales_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `massage_sales` ADD CONSTRAINT `massage_sales_servedBy_fkey` FOREIGN KEY (`servedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `massageServicePayments` ADD CONSTRAINT `massageServicePayments_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `massage_sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `massageServicePayments` ADD CONSTRAINT `massageServicePayments_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payroll` ADD CONSTRAINT `Payroll_payrollPeriodId_fkey` FOREIGN KEY (`payrollPeriodId`) REFERENCES `PayrollPeriods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientPrescription` ADD CONSTRAINT `ClientPrescription_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientPrescription` ADD CONSTRAINT `ClientPrescription_prescribedBy_fkey` FOREIGN KEY (`prescribedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryNote` ADD CONSTRAINT `DeliveryNote_registeredBy_fkey` FOREIGN KEY (`registeredBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_recievedBy_fkey` FOREIGN KEY (`recievedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_destinationStoreId_fkey` FOREIGN KEY (`destinationStoreId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplyPayments` ADD CONSTRAINT `SupplyPayments_supplyId_fkey` FOREIGN KEY (`supplyId`) REFERENCES `Supply`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplyPayments` ADD CONSTRAINT `SupplyPayments_paidBy_fkey` FOREIGN KEY (`paidBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeedlingBatch` ADD CONSTRAINT `SeedlingBatch_currentStageId_fkey` FOREIGN KEY (`currentStageId`) REFERENCES `SeedlingStages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeedlingBatchTracker` ADD CONSTRAINT `SeedlingBatchTracker_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `SeedlingBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeedlingBatchTracker` ADD CONSTRAINT `SeedlingBatchTracker_currentStageId_fkey` FOREIGN KEY (`currentStageId`) REFERENCES `SeedlingStages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeedlingDeath` ADD CONSTRAINT `SeedlingDeath_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `SeedlingBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeedlingDeath` ADD CONSTRAINT `SeedlingDeath_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `SeedlingStages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manufacturing` ADD CONSTRAINT `manufacturing_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manufacturing` ADD CONSTRAINT `manufacturing_primaryUnitId_fkey` FOREIGN KEY (`primaryUnitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manufacturing` ADD CONSTRAINT `manufacturing_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manufacturing` ADD CONSTRAINT `manufacturing_manufacturedBy_fkey` FOREIGN KEY (`manufacturedBy`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionToRole` ADD CONSTRAINT `_PermissionToRole_A_fkey` FOREIGN KEY (`A`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionToRole` ADD CONSTRAINT `_PermissionToRole_B_fkey` FOREIGN KEY (`B`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
