/*
  Warnings:

  - You are about to alter the column `type` on the `sales` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(11))`.

*/
-- AlterTable
ALTER TABLE `sales` MODIFY `type` ENUM('In_shop', 'Mobile', 'Web') NOT NULL DEFAULT 'In_shop';
