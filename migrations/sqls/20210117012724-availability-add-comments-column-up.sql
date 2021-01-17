ALTER TABLE `user_availability` 
ADD COLUMN `comment` TEXT NULL DEFAULT NULL AFTER `percentage`;