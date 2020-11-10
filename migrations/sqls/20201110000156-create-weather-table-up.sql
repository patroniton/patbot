CREATE TABLE `patbot_dev`.`weather` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `city` VARCHAR(45) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE,
  CONSTRAINT `weather_user_fk`
    FOREIGN KEY (`user_id`)
    REFERENCES `patbot_dev`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
