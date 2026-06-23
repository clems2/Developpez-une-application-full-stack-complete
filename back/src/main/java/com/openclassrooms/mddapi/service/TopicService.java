package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.TopicDto;
import com.openclassrooms.mddapi.exception.ResourceNotFoundException;
import com.openclassrooms.mddapi.models.Topic;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.SubscriptionRepository;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;

/**
 * Logique métier des sujets.
 */
@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    /**
     * Liste tous les sujets, en indiquant pour chacun si l'utilisateur courant y
     * est abonné.
     *
     * Deux requêtes seulement : la liste des sujets et l'ensemble des ids
     * abonnés de l'utilisateur, croisés en mémoire. Le DTO est
     * construit ici car le flag subscribed dépend de l'utilisateur et
     * sort du périmètre du mapper.
     *
     * @param username nom d'utilisateur courant (issu du token)
     * @return la liste des sujets, chacun avec son flag d'abonnement
     * @throws ResourceNotFoundException si l'utilisateur courant est introuvable
     */
    @Transactional(readOnly = true)
    public List<TopicDto> getAllTopics(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        Set<Long> subscribedIds = subscriptionRepository.findSubscribedTopicIds(user.getId());

        return topicRepository.findAll().stream()
                .map(topic -> toDto(topic, subscribedIds.contains(topic.getId())))
                .toList();
    }

    /** Construit le DTO d'un sujet en y injectant le flag d'abonnement. */
    private TopicDto toDto(Topic topic, boolean subscribed) {
        return new TopicDto(topic.getId(), topic.getTitle(), topic.getDescription(), subscribed);
    }
}