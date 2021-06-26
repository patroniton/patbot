CREATE TABLE `birthday` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL DEFAULT NULL,
  `name` VARCHAR(128) NULL DEFAULT NULL ,
  `birthday` DATE NOT NULL,
  `did_wish_birthday` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp,
  `updated_at` DATETIME NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE,
  CONSTRAINT `birthday_user_id_fk`
    FOREIGN KEY (`user_id`)
    REFERENCES `user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

/* Users with IDs in the system */
INSERT INTO `birthday` (`user_id`, `birthday`) VALUES ('1', '1991-07-17');
INSERT INTO `birthday` (`user_id`, `birthday`) VALUES ('2', '1996-06-28');
INSERT INTO `birthday` (`user_id`, `birthday`) VALUES ('3', '1994-06-28');
INSERT INTO `birthday` (`user_id`, `birthday`) VALUES ('4', '1992-01-08');
INSERT INTO `birthday` (`user_id`, `birthday`) VALUES ('5', '1989-12-27');
INSERT INTO `birthday` (`user_id`, `birthday`) VALUES ('6', '1995-07-19');
INSERT INTO `birthday` (`user_id`, `birthday`) VALUES ('7', '1993-11-13');

/* Users without IDs (use names to reference instead of user_id) */
INSERT INTO `birthday` (`birthday`, `name`) VALUES ('1993-02-21', 'Danielle');
INSERT INTO `birthday` (`birthday`, `name`) VALUES ('1995-05-27', 'Emily');
INSERT INTO `birthday` (`birthday`, `name`) VALUES ('1980-06-30', 'Kripp');
INSERT INTO `birthday` (`birthday`, `name`) VALUES ('2019-08-31', 'Gus');
INSERT INTO `birthday` (`birthday`, `name`) VALUES ('2019-10-17', 'Honor');
INSERT INTO `birthday` (`birthday`, `name`) VALUES ('1953-12-23', 'Billymom');
INSERT INTO `birthday` (`birthday`, `name`) VALUES ('0000-12-25', 'Jesus');
