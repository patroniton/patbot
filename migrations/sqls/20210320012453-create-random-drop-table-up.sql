CREATE TABLE `patbot_dev`.`random_drop` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `drop` VARCHAR(45) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp,
  `updated_at` DATETIME NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `random_drop_user_id_fk_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `random_drop_user_id_fk`
    FOREIGN KEY (`user_id`)
    REFERENCES `patbot_dev`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE `patbot_dev`.`random_drop` 
ADD COLUMN `discord_message_link` TEXT NOT NULL AFTER `user_id`;
