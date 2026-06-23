package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.TopicDto;
import com.openclassrooms.mddapi.exception.ResourceNotFoundException;
import com.openclassrooms.mddapi.models.Topic;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.SubscriptionRepository;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TopicServiceTest {

    @Mock
    private TopicRepository topicRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TopicService topicService;

    @Test
    void getAllTopics_shouldFlagSubscribedTopics() {
        // Given : un utilisateur abonné au topic 1 uniquement
        User user = buildUser(10L, "leo");
        Topic java = buildTopic(1L, "Java", "Langage JVM");
        Topic angular = buildTopic(2L, "Angular", "Framework front-end");

        when(userRepository.findByUsername("leo")).thenReturn(Optional.of(user));
        when(subscriptionRepository.findSubscribedTopicIds(10L)).thenReturn(Set.of(1L));
        when(topicRepository.findAll()).thenReturn(List.of(java, angular));

        // When
        List<TopicDto> result = topicService.getAllTopics("leo");

        // Then : Java abonné, Angular non
        assertThat(result).hasSize(2);
        assertThat(result).anySatisfy(dto -> {
            assertThat(dto.title()).isEqualTo("Java");
            assertThat(dto.subscribed()).isTrue();
        });
        assertThat(result).anySatisfy(dto -> {
            assertThat(dto.title()).isEqualTo("Angular");
            assertThat(dto.subscribed()).isFalse();
        });
    }

    @Test
    void getAllTopics_shouldReturnAllFalse_whenNoSubscription() {
        // Given : aucun abonnement
        User user = buildUser(10L, "leo");
        Topic java = buildTopic(1L, "Java", "Langage JVM");

        when(userRepository.findByUsername("leo")).thenReturn(Optional.of(user));
        when(subscriptionRepository.findSubscribedTopicIds(10L)).thenReturn(Set.of());
        when(topicRepository.findAll()).thenReturn(List.of(java));

        // When
        List<TopicDto> result = topicService.getAllTopics("leo");

        // Then
        assertThat(result).singleElement()
                .satisfies(dto -> assertThat(dto.subscribed()).isFalse());
    }

    @Test
    void getAllTopics_shouldThrow_whenUserUnknown() {
        // Given : l'utilisateur courant n'existe pas
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> topicService.getAllTopics("ghost"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    /** Construit un User avec un id (l'id n'a pas de setter public via constructeur métier). */
    private User buildUser(Long id, String username) {
        User user = new User(username, username + "@mdd.io", "hashed");
        user.setId(id);
        return user;
    }

    /** Construit un Topic avec un id positionné. */
    private Topic buildTopic(Long id, String title, String description) {
        Topic topic = new Topic(title, description);
        topic.setId(id);
        return topic;
    }
}