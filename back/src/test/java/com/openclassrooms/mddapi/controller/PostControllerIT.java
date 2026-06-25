package com.openclassrooms.mddapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.mddapi.dto.CreatePostRequest;
import com.openclassrooms.mddapi.models.Post;
import com.openclassrooms.mddapi.models.Topic;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.PostRepository;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration des articles (bout en bout, H2, profil test).
 * Couvre création, validation, sujet inexistant, détail et accès non authentifié.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PostControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private PostRepository postRepository;

    private User author;
    private Topic topic;

    @BeforeEach
    void setUp() {
        author = userRepository.save(new User("leo", "leo@mdd.io", "hashed"));
        topic = topicRepository.save(new Topic("Java", "Langage JVM"));
    }

    @Test
    @WithMockUser(username = "leo")
    void create_shouldReturn201WithPost() throws Exception {
        CreatePostRequest request = new CreatePostRequest(topic.getId(), "Mon article", "Le contenu");

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("Mon article"))
                .andExpect(jsonPath("$.author").value("leo"))
                .andExpect(jsonPath("$.topic").value("Java"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty());
    }

    @Test
    @WithMockUser(username = "leo")
    void create_shouldReturn400_whenTitleBlank() throws Exception {
        CreatePostRequest request = new CreatePostRequest(topic.getId(), "", "Le contenu");

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").isNotEmpty());
    }

    @Test
    @WithMockUser(username = "leo")
    void create_shouldReturn404_whenTopicUnknown() throws Exception {
        CreatePostRequest request = new CreatePostRequest(99999L, "Titre", "Contenu");

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "leo")
    void getById_shouldReturnPost() throws Exception {
        Post saved = postRepository.save(new Post("Titre", "Contenu", author, topic));

        mockMvc.perform(get("/api/posts/{id}", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId()))
                .andExpect(jsonPath("$.author").value("leo"))
                .andExpect(jsonPath("$.topic").value("Java"));
    }

    @Test
    @WithMockUser(username = "leo")
    void getById_shouldReturn404_whenUnknown() throws Exception {
        mockMvc.perform(get("/api/posts/{id}", 99999))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithAnonymousUser
    void create_shouldReturn401_whenNotAuthenticated() throws Exception {
        CreatePostRequest request = new CreatePostRequest(topic.getId(), "Titre", "Contenu");

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}