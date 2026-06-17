-- V1 : création de la table des sujets (topics).
-- par défaut de MySQL 8, et l'absence de clause reste compatible si la migration
-- devait un jour être rejouée sur H2 en MODE=MySQL.

CREATE TABLE topic (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    title       VARCHAR(100)  NOT NULL,
    description VARCHAR(1000) NOT NULL,
    CONSTRAINT pk_topic PRIMARY KEY (id),
    CONSTRAINT uq_topic_title UNIQUE (title)
);