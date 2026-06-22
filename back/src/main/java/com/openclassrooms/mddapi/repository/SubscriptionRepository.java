package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.models.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Accès aux données des abonnements.
 *
 * Les requêtes sont ciblées sur le couple (userId, topicId) : tester
 * l'existence (abonnement déjà présent), supprimer un abonnement précis, et
 * lister les abonnements d'un utilisateur (page profil, calcul du flag
 * subscribed).
 */
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    /** Indique si l'utilisateur est déjà abonné à ce sujet. */
    boolean existsByUserIdAndTopicId(Long userId, Long topicId);

    /** Liste les abonnements d'un utilisateur. */
    List<Subscription> findByUserId(Long userId);

    /**
     * Supprime l'abonnement reliant cet utilisateur à ce sujet, s'il existe.
     *
     * @return le nombre de lignes supprimées (0 si l'abonnement n'existait pas)
     */
    long deleteByUserIdAndTopicId(Long userId, Long topicId);
}