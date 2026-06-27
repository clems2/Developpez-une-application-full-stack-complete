package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.models.Subscription;
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
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration de l'endpoint des topics. Valide la chaîne controller -> service -> mapper ->
 * repository et la sérialisation JSON réellement produite. 
 * @WithMockUser au niveau classe : la majorité des cas testent l'e 'endpoint authentifié ; le
 * cas anonyme est surchargé par méthode pour vérifier la barrière de sécurité.
 * Vérifie la liste des sujets et le flag d'abonnement par-utilisateur.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TopicControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @BeforeEach
    void setUp() {
        User leo = userRepository.save(new User("leo", "leo@mdd.io", "hashed"));
        Topic java = topicRepository.save(new Topic("Java", "Langage JVM"));
        topicRepository.save(new Topic("Angular", "Framework front-end TypeScript"));
        // leo est abonné à Java seulement
        subscriptionRepository.save(new Subscription(leo, java));
    }

    @Test
    @WithMockUser(username = "leo")
    void getAllTopics_shouldReturnAllTopicsWithSubscriptionFlag() throws Exception {
        mockMvc.perform(get("/api/topics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                // Java : leo est abonné
                .andExpect(jsonPath("$[?(@.title == 'Java')].subscribed").value(true))
                // Angular : leo n'est pas abonné
                .andExpect(jsonPath("$[?(@.title == 'Angular')].subscribed").value(false));
    }

    @Test
    @WithMockUser(username = "leo")
    void getAllTopics_shouldReturnAllFalse_whenUserHasNoSubscription() throws Exception {
        subscriptionRepository.deleteAll();

        mockMvc.perform(get("/api/topics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[?(@.subscribed == true)]", hasSize(0)));
    }

    @Test
    @WithAnonymousUser
    void getAllTopics_shouldReturn401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/topics"))
                .andExpect(status().isUnauthorized());
    }
}