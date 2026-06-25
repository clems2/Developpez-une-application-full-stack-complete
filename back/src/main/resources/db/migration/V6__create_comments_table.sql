-- V6 : commentaires d'un article (relation unidirectionnelle Comment -> Post / -> User).
-- Auteur et date posés serveur. created_at non modifiable après insertion.
-- content borné à 1000 caractères (commentaire court, distinct du TEXT de posts).
-- FK post_id en CASCADE : supprimer un article retire ses commentaires (pas d'orphelin).
CREATE TABLE comments (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    content    VARCHAR(1000) NOT NULL,
    created_at DATETIME NOT NULL,
    author_id  BIGINT NOT NULL,
    post_id    BIGINT NOT NULL,
    CONSTRAINT pk_comments PRIMARY KEY (id),
    CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users (id),
    CONSTRAINT fk_comments_post   FOREIGN KEY (post_id)   REFERENCES posts (id) ON DELETE CASCADE
);