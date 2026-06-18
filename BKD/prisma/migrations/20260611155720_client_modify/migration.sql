-- AlterTable
ALTER TABLE `clients` MODIFY `dob` DATETIME(3) NULL,
    MODIFY `gender` ENUM('MALE', 'FEMALE') NULL;
