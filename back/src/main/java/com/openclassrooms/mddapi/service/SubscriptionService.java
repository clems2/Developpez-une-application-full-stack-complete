package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.exception.ResourceNotFoundException;
import com.openclassrooms.mddapi.models.Subscription;
import com.openclassrooms.mddapi.models.Topic;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.SubscriptionRepository;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Logique d'abonnement et de désabonnement d'un utilisateur à un sujet.
 *
 * Les deux opérations sont idempotentes : s'abonner alors
 * qu'on l'est déjà, ou se désabonner d'un sujet auquel on n'est pas abonné, ne
 * produit ni doublon ni erreur. L'unicité du couple (user, topic) reste
 * garantie en dernier ressort par la contrainte en base.
 */
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;

    /**
     * Abonne l'utilisateur courant à un sujet. Idempotent : sans effet s'il est
     * déjà abonné.
     *
     * @param username nom d'utilisateur courant (issu du token)
     * @param topicId  identifiant du sujet
     * @throws ResourceNotFoundException si le sujet n'existe pas
     */
    @Transactional
    public void subscribe(String username, Long topicId) {
        User user = resolveUser(username);
        Topic topic = resolveTopic(topicId);

        if (subscriptionRepository.existsByUserIdAndTopicId(user.getId(), topic.getId())) {
            return;
        }
        subscriptionRepository.save(new Subscription(user, topic));
    }

    /**
     * Désabonne l'utilisateur courant d'un sujet. Idempotent : sans effet s'il
     * n'était pas abonné.
     *
     * @param username nom d'utilisateur courant (issu du token)
     * @param topicId  identifiant du sujet
     * @throws ResourceNotFoundException si le sujet n'existe pas
     */
    @Transactional
    public void unsubscribe(String username, Long topicId) {
        User user = resolveUser(username);
        Topic topic = resolveTopic(topicId);

        subscriptionRepository.deleteByUserIdAndTopicId(user.getId(), topic.getId());
    }
    
    
    /**
     * Indique si un utilisateur est abonné à un sujet donné.
     *
     * Prend directement les identifiants (et non le username) : l'appelant a déjà
     * résolu l'utilisateur et le sujet, on évite ainsi une résolution redondante.
     * La connaissance « qui est abonné à quoi » reste encapsulée dans ce service.
     *
     * @param userId  identifiant de l'utilisateur
     * @param topicId identifiant du sujet
     * @return {@code true} si l'abonnement existe
     */
    @Transactional(readOnly = true)
    public boolean isSubscribed(Long userId, Long topicId) {
        return subscriptionRepository.existsByUserIdAndTopicId(userId, topicId);
    }

    /** Résout l'utilisateur courant à partir de son nom d'utilisateur. */
    private User resolveUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    /** Résout le sujet ciblé ou lève une 404. */
    private Topic resolveTopic(Long topicId) {
        return topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Sujet introuvable"));
    }
}