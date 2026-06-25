package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.CommentDto;
import com.openclassrooms.mddapi.dto.CreateCommentRequest;
import com.openclassrooms.mddapi.exception.ResourceNotFoundException;
import com.openclassrooms.mddapi.models.Comment;
import com.openclassrooms.mddapi.models.Post;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.CommentRepository;
import com.openclassrooms.mddapi.repository.PostRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock private CommentRepository commentRepository;
    @Mock private PostRepository postRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private CommentService commentService;

    private User user(String username) {
        User u = new User();
        u.setId(1L);
        u.setUsername(username);
        return u;
    }

    @Test
    void create_shouldPersistWithResolvedAuthorAndReturnDto() {
        Post post = new Post();
        post.setId(5L);
        User author = user("leo");
        when(postRepository.findById(5L)).thenReturn(Optional.of(post));
        when(userRepository.findByUsername("leo")).thenReturn(Optional.of(author));
        when(commentRepository.save(any(Comment.class))).thenAnswer(inv -> {
            Comment c = inv.getArgument(0);
            c.setId(42L);
            c.setCreatedAt(LocalDateTime.now());
            return c;
        });

        CommentDto dto = commentService.create(5L, "leo", new CreateCommentRequest("Bien vu"));

        assertThat(dto.id()).isEqualTo(42L);
        assertThat(dto.content()).isEqualTo("Bien vu");
        assertThat(dto.author()).isEqualTo("leo");
        assertThat(dto.createdAt()).isNotNull();

        // l'entité persistée porte bien le post et l'auteur résolus côté serveur
        ArgumentCaptor<Comment> captor = ArgumentCaptor.forClass(Comment.class);
        verify(commentRepository).save(captor.capture());
        assertThat(captor.getValue().getPost()).isSameAs(post);
        assertThat(captor.getValue().getAuthor()).isSameAs(author);
    }

    @Test
    void create_shouldThrowAndNotSaveWhenPostMissing() {
        when(postRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.create(999L, "leo", new CreateCommentRequest("x")))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(commentRepository, never()).save(any());
    }

    @Test
    void create_shouldThrowWhenUserMissing() {
        when(postRepository.findById(5L)).thenReturn(Optional.of(new Post()));
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.create(5L, "ghost", new CreateCommentRequest("x")))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(commentRepository, never()).save(any());
    }

    @Test
    void getByPostId_shouldMapInRepositoryOrder() {
        User author = user("leo");
        Comment c1 = new Comment();
        c1.setId(1L); c1.setContent("premier"); c1.setAuthor(author); c1.setCreatedAt(LocalDateTime.now().minusMinutes(2));
        Comment c2 = new Comment();
        c2.setId(2L); c2.setContent("second"); c2.setAuthor(author); c2.setCreatedAt(LocalDateTime.now());
        when(commentRepository.findByPostIdWithAuthorOrderByCreatedAtAsc(5L)).thenReturn(List.of(c1, c2));

        List<CommentDto> dtos = commentService.getByPostId(5L);

        assertThat(dtos).extracting(CommentDto::content).containsExactly("premier", "second");
        assertThat(dtos).allSatisfy(d -> assertThat(d.author()).isEqualTo("leo"));
    }
}