package com.openclassrooms.mddapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.mddapi.dto.UpdateProfileRequest;
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
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MeControllerIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private TopicRepository topicRepository;
    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private User leo;

    @BeforeEach
    void setUp() {
        leo = new User();
        leo.setUsername("leo");
        leo.setEmail("leo@mdd.io");
        leo.setPassword(passwordEncoder.encode("Password1!"));
        leo = userRepository.save(leo);

        Topic java = new Topic();
        java.setTitle("Java");
        java.setDescription("Le langage Java");
        java = topicRepository.save(java);

        Subscription sub = new Subscription();
        sub.setUser(leo);
        sub.setTopic(java);
        subscriptionRepository.save(sub);
    }

    @Test
    @WithMockUser(username = "leo")
    void getMe_shouldReturnProfileWithSubscriptions() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("leo"))
                .andExpect(jsonPath("$.email").value("leo@mdd.io"))
                .andExpect(jsonPath("$.subscriptions.length()").value(1))
                .andExpect(jsonPath("$.subscriptions[0].title").value("Java"))
                .andExpect(jsonPath("$.subscriptions[0].subscribed").value(true));
    }

    @Test
    @WithMockUser(username = "leo")
    void updateMe_shouldUpdateUsernameAndEmail() throws Exception {
        String body = objectMapper.writeValueAsString(
                new UpdateProfileRequest("leo_renamed", "leo_new@mdd.io", ""));

        mockMvc.perform(put("/api/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("leo_renamed"))
                .andExpect(jsonPath("$.email").value("leo_new@mdd.io"));
    }

    @Test
    @WithMockUser(username = "leo")
    void updateMe_withBlankPassword_shouldLeavePasswordUnchanged() throws Exception {
        String originalHash = leo.getPassword();
        String body = objectMapper.writeValueAsString(
                new UpdateProfileRequest("leo", "leo@mdd.io", ""));

        mockMvc.perform(put("/api/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        assertThat(userRepository.findByUsername("leo").orElseThrow().getPassword())
                .isEqualTo(originalHash);
    }

    @Test
    @WithMockUser(username = "leo")
    void updateMe_withInvalidPassword_shouldReturn400() throws Exception {
        String body = objectMapper.writeValueAsString(
                new UpdateProfileRequest("leo", "leo@mdd.io", "weak"));

        mockMvc.perform(put("/api/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "leo")
    void updateMe_withTakenEmail_shouldReturn409() throws Exception {
        User other = new User();
        other.setUsername("other");
        other.setEmail("taken@mdd.io");
        other.setPassword(passwordEncoder.encode("Password1!"));
        userRepository.save(other);

        String body = objectMapper.writeValueAsString(
                new UpdateProfileRequest("leo", "taken@mdd.io", ""));

        mockMvc.perform(put("/api/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void getMe_anonymous_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized());
    }
}