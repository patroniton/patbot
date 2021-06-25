/* Create random drop type table */
CREATE TABLE `random_drop_type` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `chance` INT NOT NULL,
  `emoji` VARCHAR(45) CHARACTER SET 'utf8mb4' NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp,
  `updated_at` DATETIME NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`));

/* Add drop type foreign key to random drops table */
ALTER TABLE `random_drop` 
ADD COLUMN `random_drop_type_id` INT NULL DEFAULT NULL AFTER `user_id`,
ADD INDEX `random_drop_type_fk_idx` (`random_drop_type_id` ASC) VISIBLE;
;
ALTER TABLE `random_drop` 
ADD CONSTRAINT `random_drop_type_fk`
  FOREIGN KEY (`random_drop_type_id`)
  REFERENCES `random_drop_type` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

/* Insert drop types into drop table  */
INSERT INTO `random_drop_type` (`chance`, `emoji`, `created_at`, `updated_at`) VALUES ('1000000', '👑', '2021-06-24 00:00:00', '2021-06-24 00:00:00');
INSERT INTO `random_drop_type` (`chance`, `emoji`, `created_at`, `updated_at`) VALUES ('100000', '💎', '2021-06-24 00:00:00', '2021-06-24 00:00:00');
INSERT INTO `random_drop_type` (`chance`, `emoji`, `created_at`, `updated_at`) VALUES ('10000', '💸', '2021-06-24 00:00:00', '2021-06-24 00:00:00');
INSERT INTO `random_drop_type` (`chance`, `emoji`, `created_at`, `updated_at`) VALUES ('1000', '🏆', '2021-06-24 00:00:00', '2021-06-24 00:00:00');
INSERT INTO `random_drop_type` (`chance`, `emoji`, `created_at`, `updated_at`) VALUES ('100', '🧀', '2021-06-24 00:00:00', '2021-06-24 00:00:00');

UPDATE random_drop
SET random_drop_type_id = 4
WHERE `drop` = 'thousand'
AND id > 0;

UPDATE random_drop
SET random_drop_type_id = 5
WHERE `drop` = 'hundred'
AND id > 0;

/* Drop columns after transfer to new ID columns */
ALTER TABLE `random_drop` 
DROP COLUMN `emoji`,
DROP COLUMN `drop`;