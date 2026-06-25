package com.openclassrooms.mddapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.mddapi.dto.CreateCommentRequest;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CommentControllerIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private TopicRepository topicRepository;
    @Autowired private PostRepository postRepository;

    private Post post;

    @BeforeEach
    void setUp() {
        User author = new User();
        author.setUsername("leo");
        author.setEmail("leo@mdd.io");
        author.setPassword("irrelevant-hash");
        author = userRepository.save(author);

        Topic topic = new Topic();
        topic.setTitle("Java");
        topic.setDescription("Le langage Java");
        topic = topicRepository.save(topic);

        Post p = new Post();
        p.setTitle("Premier article");
        p.setContent("Contenu de l'article");
        p.setAuthor(author);
        p.setTopic(topic);
        post = postRepository.save(p);
    }

    @Test
    @WithMockUser(username = "leo")
    void create_shouldReturn201WithResolvedAuthorAndDate() throws Exception {
        String body = objectMapper.writeValueAsString(new CreateCommentRequest("Très clair, merci"));

        mockMvc.perform(post("/api/posts/{postId}/comments", post.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.content").value("Très clair, merci"))
                .andExpect(jsonPath("$.author").value("leo"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty());
    }

    @Test
    @WithMockUser(username = "leo")
    void create_shouldReturn404WhenPostDoesNotExist() throws Exception {
        String body = objectMapper.writeValueAsString(new CreateCommentRequest("Coucou"));

        mockMvc.perform(post("/api/posts/{postId}/comments", 999999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "leo")
    void create_shouldReturn400WhenContentBlank() throws Exception {
        String body = objectMapper.writeValueAsString(new CreateCommentRequest("   "));

        mockMvc.perform(post("/api/posts/{postId}/comments", post.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_shouldReturn401WhenAnonymous() throws Exception {
        String body = objectMapper.writeValueAsString(new CreateCommentRequest("Anonyme"));

        mockMvc.perform(post("/api/posts/{postId}/comments", post.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "leo")
    void getPostDetail_shouldIncludeCommentsInChronologicalOrder() throws Exception {
        // deux commentaires créés successivement
        mockMvc.perform(post("/api/posts/{postId}/comments", post.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateCommentRequest("premier"))))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/posts/{postId}/comments", post.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateCommentRequest("second"))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/posts/{id}", post.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.comments.length()").value(2))
                .andExpect(jsonPath("$.comments[0].content").value("premier"))
                .andExpect(jsonPath("$.comments[1].content").value("second"));
    }
}