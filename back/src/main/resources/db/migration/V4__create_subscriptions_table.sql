-- V4 : table de liaison des abonnements (utilisateur <-> sujet).
-- Entité de liaison explicite avec id surrogate (cohérent avec users/topics).
-- La contrainte d'unicité (user_id, topic_id) empêche le double-abonnement.
-- Les clés étrangères cascadent à la suppression d'un utilisateur ou d'un sujet :
-- supprimer l'un retire logiquement ses abonnements (pas d'abonnement orphelin).

CREATE TABLE subscriptions (
    id       BIGINT NOT NULL AUTO_INCREMENT,
    user_id  BIGINT NOT NULL,
    topic_id BIGINT NOT NULL,
    CONSTRAINT pk_subscriptions PRIMARY KEY (id),
    CONSTRAINT uq_subscriptions_user_topic UNIQUE (user_id, topic_id),
    CONSTRAINT fk_subscriptions_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_subscriptions_topic
        FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE
);