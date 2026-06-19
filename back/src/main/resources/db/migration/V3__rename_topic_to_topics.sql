-- V3 : renommage de la table `topic` en `topics` pour uniformiser la nomenclature
-- au pluriel sur tout le schéma (users, topics, puis posts, comments, subscriptions).
-- Migration dédiée : V1 est déjà appliquée et ne doit jamais être modifiée (checksum Flyway).

RENAME TABLE topic TO topics;

-- L'index d'unicité garderait sinon son ancien nom (uq_topic_title) sur `topics` ;
-- on l'aligne pour rester cohérent. La PK est nommée PRIMARY en interne par MySQL
-- (le `CONSTRAINT pk_topic` de V1 est ignoré), aucun renommage nécessaire de ce côté.
ALTER TABLE topics RENAME INDEX uq_topic_title TO uq_topics_title;