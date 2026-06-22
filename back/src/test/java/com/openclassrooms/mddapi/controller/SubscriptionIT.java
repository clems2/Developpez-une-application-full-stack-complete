package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.models.Topic;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.SubscriptionRepository;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration des abonnements (bout en bout, H2, profil test).
 * Couvre l'abonnement, son idempotence, le désabonnement, le sujet inexistant et l'accès non authentifié.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SubscriptionIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    private Long topicId;

    @BeforeEach
    void setUp() {
        userRepository.save(new User("leo", "leo@mdd.io", "hashed"));
        Topic topic = topicRepository.save(new Topic("Java", "Langage JVM"));
        this.topicId = topic.getId();
    }

    @Test
    @WithMockUser(username = "leo")
    void subscribe_shouldCreateSubscription() throws Exception {
        mockMvc.perform(post("/api/topics/{id}/subscribe", topicId))
                .andExpect(status().isOk());

        User leo = userRepository.findByUsername("leo").orElseThrow();
        assertThat(subscriptionRepository.existsByUserIdAndTopicId(leo.getId(), topicId)).isTrue();
    }

    @Test
    @WithMockUser(username = "leo")
    void subscribe_shouldBeIdempotent_whenAlreadySubscribed() throws Exception {
        // Given : déjà abonné
        mockMvc.perform(post("/api/topics/{id}/subscribe", topicId))
                .andExpect(status().isOk());

        // When : second abonnement → toujours 200, pas d'erreur, pas de doublon
        mockMvc.perform(post("/api/topics/{id}/subscribe", topicId))
                .andExpect(status().isOk());

        // Then : une seule ligne en base
        User leo = userRepository.findByUsername("leo").orElseThrow();
        assertThat(subscriptionRepository.findByUserId(leo.getId())).hasSize(1);
    }

    @Test
    @WithMockUser(username = "leo")
    void unsubscribe_shouldRemoveSubscription() throws Exception {
        // Given : abonné
        mockMvc.perform(post("/api/topics/{id}/subscribe", topicId))
                .andExpect(status().isOk());

        // When : désabonnement
        mockMvc.perform(delete("/api/topics/{id}/subscribe", topicId))
                .andExpect(status().isOk());

        // Then : plus aucun abonnement
        User leo = userRepository.findByUsername("leo").orElseThrow();
        assertThat(subscriptionRepository.findByUserId(leo.getId())).isEmpty();
    }

    @Test
    @WithMockUser(username = "leo")
    void unsubscribe_shouldBeIdempotent_whenNotSubscribed() throws Exception {
        // Désabonnement sans abonnement préalable → 200, pas d'erreur
        mockMvc.perform(delete("/api/topics/{id}/subscribe", topicId))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "leo")
    void subscribe_shouldReturn404_whenTopicUnknown() throws Exception {
        mockMvc.perform(post("/api/topics/{id}/subscribe", 99999))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithAnonymousUser
    void subscribe_shouldReturn401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(post("/api/topics/{id}/subscribe", topicId))
                .andExpect(status().isUnauthorized());
    }
}