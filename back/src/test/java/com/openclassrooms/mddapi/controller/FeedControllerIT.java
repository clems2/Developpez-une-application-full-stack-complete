package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.models.Post;
import com.openclassrooms.mddapi.models.Subscription;
import com.openclassrooms.mddapi.models.Topic;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.PostRepository;
import com.openclassrooms.mddapi.repository.SubscriptionRepository;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FeedControllerIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private TopicRepository topicRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private SubscriptionRepository subscriptionRepository;

    private User author;
    private Topic java;

    @BeforeEach
    void setUp() throws InterruptedException {
        author = new User();
        author.setUsername("author");
        author.setEmail("author@mdd.io");
        author.setPassword("irrelevant-hash");
        author = userRepository.save(author);

        User leo = new User();
        leo.setUsername("leo");
        leo.setEmail("leo@mdd.io");
        leo.setPassword("irrelevant-hash");
        leo = userRepository.save(leo);

        java = topicRepository.save(topic("Java", "Le langage Java"));
        Topic python = topicRepository.save(topic("Python", "Le langage Python"));

        // leo est abonné à Java UNIQUEMENT
        Subscription sub = new Subscription();
        sub.setUser(leo);
        sub.setTopic(java);
        subscriptionRepository.save(sub);

        // Deux articles Java (visibles), espacés pour garantir des createdAt distincts
        savePost("Java 1", java);
        Thread.sleep(10); // @CreationTimestamp : 10 ms suffisent à différencier l'ordre
        savePost("Java 2", java);

        // Un article Python (NON visible : leo n'est pas abonné), et le plus récent —
        // prouve que le filtrage est par abonnement, pas seulement par date.
        Thread.sleep(10);
        savePost("Python 1", python);
    }

    private Topic topic(String title, String description) {
        Topic t = new Topic();
        t.setTitle(title);
        t.setDescription(description);
        return t;
    }

    private void savePost(String title, Topic topic) {
        Post p = new Post();
        p.setTitle(title);
        p.setContent("contenu de " + title);
        p.setTopic(topic);
        p.setAuthor(author);
        postRepository.save(p);
    }

    @Test
    @WithMockUser(username = "leo")
    void getFeed_shouldReturnOnlySubscribedTopicPosts_descByDefault() throws Exception {
        mockMvc.perform(get("/api/feed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))           // Python exclu
                .andExpect(jsonPath("$[0].title").value("Java 2"))    // plus récent d'abord
                .andExpect(jsonPath("$[1].title").value("Java 1"))
                .andExpect(jsonPath("$[0].topic").value("Java"));
    }

    @Test
    @WithMockUser(username = "leo")
    void getFeed_withOrderAsc_shouldReturnAscending() throws Exception {
        mockMvc.perform(get("/api/feed").param("order", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Java 1"))    // plus ancien d'abord
                .andExpect(jsonPath("$[1].title").value("Java 2"));
    }

    @Test
    @WithMockUser(username = "solo")
    void getFeed_withNoSubscriptions_shouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/feed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));          // fil vide = 200 + []
    }

    @Test
    void getFeed_anonymous_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/feed"))
                .andExpect(status().isUnauthorized());
    }
}