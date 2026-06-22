package com.openclassrooms.mddapi.models;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Abonnement d'un utilisateur à un sujet.
 *
 * Entité de liaison explicite (et non un @ManyToMany) afin de pouvoir
 * cibler les opérations d'abonnement par des requêtes dédiées
 * (existsByUserIdAndTopicId, deleteByUserIdAndTopicId) et rester
 * extensible (ex. date d'abonnement).
 *
 * La contrainte d'unicité (user_id, topic_id) garantit qu'un
 * utilisateur ne peut s'abonner qu'une seule fois à un même sujet ; l'identité
 * technique reste un id généré, cohérent avec les autres entités.
 */
@Entity
@Table(
        name = "subscriptions",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_subscriptions_user_topic",
                columnNames = {"user_id", "topic_id"})
)
@Getter
@Setter
@NoArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    /**
     * Construit un abonnement reliant un utilisateur à un sujet.
     * L'id est généré par la base.
     *
     * @param user  utilisateur qui s'abonne
     * @param topic sujet auquel il s'abonne
     */
    public Subscription(User user, Topic topic) {
        this.user = user;
        this.topic = topic;
    }
}