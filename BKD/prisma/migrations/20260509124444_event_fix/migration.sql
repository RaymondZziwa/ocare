-- AlterTable
ALTER TABLE `events` ADD COLUMN `capacity` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `event_participants` ADD CONSTRAINT `event_participants_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
