package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.CreatePostRequest;
import com.openclassrooms.mddapi.dto.PostDto;
import com.openclassrooms.mddapi.exception.ResourceNotFoundException;
import com.openclassrooms.mddapi.models.Post;
import com.openclassrooms.mddapi.models.Topic;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.PostRepository;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TopicRepository topicRepository;

    @InjectMocks
    private PostService postService;

    @Test
    void create_shouldSaveAndReturnDto() {
        // Given
        User author = buildUser(10L, "leo");
        Topic topic = buildTopic(1L, "Java", "Langage JVM");
        CreatePostRequest request = new CreatePostRequest(1L, "Mon titre", "Mon contenu");

        when(userRepository.findByUsername("leo")).thenReturn(Optional.of(author));
        when(topicRepository.findById(1L)).thenReturn(Optional.of(topic));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post p = invocation.getArgument(0);
            p.setId(99L);
            p.setCreatedAt(LocalDateTime.now());   // simule @CreationTimestamp
            return p;
        });

        // When
        PostDto result = postService.create("leo", request);

        // Then
        assertThat(result.id()).isEqualTo(99L);
        assertThat(result.title()).isEqualTo("Mon titre");
        assertThat(result.author()).isEqualTo("leo");
        assertThat(result.topic()).isEqualTo("Java");
        assertThat(result.createdAt()).isNotNull();
    }

    @Test
    void create_shouldThrow_whenTopicUnknown() {
        // Given : utilisateur OK, sujet inexistant
        when(userRepository.findByUsername("leo")).thenReturn(Optional.of(buildUser(10L, "leo")));
        when(topicRepository.findById(999L)).thenReturn(Optional.empty());

        CreatePostRequest request = new CreatePostRequest(999L, "Titre", "Contenu");

        // When / Then
        assertThatThrownBy(() -> postService.create("leo", request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getById_shouldReturnDto() {
        // Given
        Post post = new Post("Titre", "Contenu", buildUser(10L, "leo"), buildTopic(1L, "Java", "JVM"));
        post.setId(5L);
        post.setCreatedAt(LocalDateTime.now());
        when(postRepository.findByIdWithAuthorAndTopic(5L)).thenReturn(Optional.of(post));

        // When
        PostDto result = postService.getById(5L);

        // Then
        assertThat(result.id()).isEqualTo(5L);
        assertThat(result.author()).isEqualTo("leo");
        assertThat(result.topic()).isEqualTo("Java");
    }

    @Test
    void getById_shouldThrow_whenNotFound() {
        // Given
        when(postRepository.findByIdWithAuthorAndTopic(999L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> postService.getById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getFeed_shouldUseDescendingByDefault() {
        when(postRepository.findFeedForUser(eq("leo"), any(Sort.class))).thenReturn(List.of());

        postService.getFeed("leo", "desc");

        ArgumentCaptor<Sort> captor = ArgumentCaptor.forClass(Sort.class);
        verify(postRepository).findFeedForUser(eq("leo"), captor.capture());
        assertThat(captor.getValue().getOrderFor("createdAt").getDirection())
                .isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void getFeed_shouldUseAscendingWhenRequested() {
        when(postRepository.findFeedForUser(eq("leo"), any(Sort.class))).thenReturn(List.of());

        postService.getFeed("leo", "asc");

        ArgumentCaptor<Sort> captor = ArgumentCaptor.forClass(Sort.class);
        verify(postRepository).findFeedForUser(eq("leo"), captor.capture());
        assertThat(captor.getValue().getOrderFor("createdAt").getDirection())
                .isEqualTo(Sort.Direction.ASC);
    }

    @Test
    void getFeed_shouldFallBackToDescendingOnUnknownOrder() {
        when(postRepository.findFeedForUser(eq("leo"), any(Sort.class))).thenReturn(List.of());

        postService.getFeed("leo", "n'importe quoi");

        ArgumentCaptor<Sort> captor = ArgumentCaptor.forClass(Sort.class);
        verify(postRepository).findFeedForUser(eq("leo"), captor.capture());
        assertThat(captor.getValue().getOrderFor("createdAt").getDirection())
                .isEqualTo(Sort.Direction.DESC);
    }

    private User buildUser(Long id, String username) {
        User user = new User(username, username + "@mdd.io", "hashed");
        user.setId(id);
        return user;
    }

    private Topic buildTopic(Long id, String title, String description) {
        Topic topic = new Topic(title, description);
        topic.setId(id);
        return topic;
    }
}