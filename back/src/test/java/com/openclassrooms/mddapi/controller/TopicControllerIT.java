package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.models.Topic;
import com.openclassrooms.mddapi.repository.TopicRepository;
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

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration de l'endpoint des topics. Valide la chaîne controller -> service -> mapper ->
 * repository et la sérialisation JSON réellement produite. 
 * @WithMockUser au niveau classe : la majorité des cas testent l'e 'endpoint authentifié ; le
 * cas anonyme est surchargé par méthode pour vérifier la barrière de sécurité.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
@ActiveProfiles("test")
@Transactional
class TopicControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TopicRepository topicRepository;

    @BeforeEach
    void setUp() {
        topicRepository.save(new Topic("Java", "Langage orienté objet sur la JVM"));
        topicRepository.save(new Topic("Angular", "Framework front-end TypeScript"));
    }

    @Test
    void getAllTopics_shouldReturnAllTopics() throws Exception {
        mockMvc.perform(get("/api/topics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].title", containsInAnyOrder("Java", "Angular")))
                .andExpect(jsonPath("$[0].id", notNullValue()))
                .andExpect(jsonPath("$[0].description", not(emptyString())));
    }

    @Test
    void getAllTopics_shouldReturnEmptyListWhenNoTopic() throws Exception {
        topicRepository.deleteAll();

        mockMvc.perform(get("/api/topics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @WithAnonymousUser   // surcharge le @WithMockUser de la classe : prouve que /api/topics est protégé
    void getAllTopics_shouldReturn401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/topics"))
                .andExpect(status().isUnauthorized());
    }
}