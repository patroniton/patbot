CREATE TABLE `apex_game` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `place` INT NOT NULL,
  `total_kills` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp,
  `updated_at` DATETIME NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);

CREATE TABLE `apex_game_stats` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `apex_game_id` INT NOT NULL,
  `kills` INT NOT NULL,
  `damage_dealt` INT NOT NULL,
  `survival_time` VARCHAR(45) NOT NULL,
  `revive_given` INT NOT NULL,
  `respawn_given` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp,
  `updated_at` DATETIME NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `apex_game_stats_user_fk_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `apex_game_stats_user_fk`
    FOREIGN KEY (`user_id`)
    REFERENCES `user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE `apex_game_stats` 
ADD INDEX `apex_game_stats_game_fk_idx` (`apex_game_id` ASC) VISIBLE;

ALTER TABLE `apex_game_stats` 
ADD CONSTRAINT `apex_game_stats_game_fk`
  FOREIGN KEY (`apex_game_id`)
  REFERENCES `apex_game` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `apex_game_stats` 
DROP FOREIGN KEY `apex_game_stats_user_fk`;
ALTER TABLE `apex_game_stats` 
CHANGE COLUMN `user_id` `user_id` INT NULL DEFAULT NULL ;
ALTER TABLE `apex_game_stats` 
ADD CONSTRAINT `apex_game_stats_user_fk`
  FOREIGN KEY (`user_id`)
  REFERENCES `user` (`id`);

INSERT INTO `user_nickname` (`user_id`, `nickname`) VALUES ('2', 'Doooooooooo');
INSERT INTO `user_nickname` (`user_id`, `nickname`) VALUES ('2', 'Dooooooooo');
INSERT INTO `user_nickname` (`user_id`, `nickname`) VALUES ('2', 'Doooooooo');
INSERT INTO `user_nickname` (`user_id`, `nickname`) VALUES ('2', 'Dooooooo');
INSERT INTO `user_nickname` (`user_id`, `nickname`) VALUES ('2', 'Doooooo');
INSERT INTO `user_nickname` (`user_id`, `nickname`) VALUES ('2', 'Dooooo');
INSERT INTO `user_nickname` (`user_id`, `nickname`) VALUES ('2', 'Doooo');
INSERT INTO `user_nickname` (`user_id`, `nickname`) VALUES ('2', 'Dooo');
INSERT INTO `user_nickname` (`user_id`, `nickname`) VALUES ('2', 'Doo');
INSERT INTO `user_nickname` (`user_id`, `nickname`) VALUES ('2', 'Do');
INSERT INTO `user_nickname` (`user_id`, `nickname`) VALUES ('1', 'The Patvocate');

ALTER TABLE `apex_game` 
ADD COLUMN `screenshot` TEXT NULL DEFAULT NULL AFTER `total_kills`;

ALTER TABLE `user_nickname` 
ADD COLUMN `preferred` INT NOT NULL DEFAULT 0 AFTER `nickname`;

UPDATE `user_nickname` SET `preferred` = '1' WHERE (`id` = '1');
UPDATE `user_nickname` SET `preferred` = '1' WHERE (`id` = '5');
UPDATE `user_nickname` SET `preferred` = '1' WHERE (`id` = '8');
UPDATE `user_nickname` SET `preferred` = '1' WHERE (`id` = '13');
UPDATE `user_nickname` SET `preferred` = '1' WHERE (`id` = '18');
UPDATE `user_nickname` SET `preferred` = '1' WHERE (`id` = '29');
