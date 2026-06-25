-- V5 : table des articles.
-- content en TEXT (article potentiellement long, au-delà d'un VARCHAR).
-- created_at en DATETIME, posé côté serveur (jamais fourni par le client).
-- FK author/topic en ON DELETE CASCADE : supprimer un utilisateur ou un sujet
-- retire ses articles (pas d'article orphelin), sans affecter l'autre côté.

CREATE TABLE posts (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    title      VARCHAR(100) NOT NULL,
    content    TEXT         NOT NULL,
    created_at DATETIME     NOT NULL,
    author_id  BIGINT       NOT NULL,
    topic_id   BIGINT       NOT NULL,
    CONSTRAINT pk_posts PRIMARY KEY (id),
    CONSTRAINT fk_posts_author
        FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_posts_topic
        FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE
);