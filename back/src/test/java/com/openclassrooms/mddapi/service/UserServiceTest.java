package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.UpdateProfileRequest;
import com.openclassrooms.mddapi.dto.UserProfileDto;
import com.openclassrooms.mddapi.exception.BadRequestException;
import com.openclassrooms.mddapi.exception.ConflictException;
import com.openclassrooms.mddapi.models.Topic;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TopicRepository topicRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @InjectMocks private UserService userService;

    private User leo;

    @BeforeEach
    void setUp() {
        leo = new User();
        leo.setId(1L);
        leo.setUsername("leo");
        leo.setEmail("leo@mdd.io");
        leo.setPassword("OLD_HASH");
    }

    @Test
    void getProfile_shouldReturnInfoAndSubscriptions() {
        Topic java = new Topic();
        java.setId(10L); java.setTitle("Java"); java.setDescription("Le langage Java");
        when(userRepository.findByUsername("leo")).thenReturn(Optional.of(leo));
        when(topicRepository.findSubscribedByUserId(1L)).thenReturn(List.of(java));

        UserProfileDto dto = userService.getProfile("leo");

        assertThat(dto.username()).isEqualTo("leo");
        assertThat(dto.email()).isEqualTo("leo@mdd.io");
        assertThat(dto.subscriptions()).hasSize(1);
        assertThat(dto.subscriptions().get(0).subscribed()).isTrue();
    }

    @Test
    void updateProfile_shouldUpdateFieldsWithoutTouchingPasswordWhenBlank() {
        when(userRepository.findByUsername("leo")).thenReturn(Optional.of(leo));
        when(userRepository.existsByUsernameAndIdNot("leo2", 1L)).thenReturn(false);
        when(userRepository.existsByEmailAndIdNot("leo2@mdd.io", 1L)).thenReturn(false);
        when(topicRepository.findSubscribedByUserId(1L)).thenReturn(List.of());

        userService.updateProfile("leo", new UpdateProfileRequest("leo2", "leo2@mdd.io", ""));

        assertThat(leo.getUsername()).isEqualTo("leo2");
        assertThat(leo.getEmail()).isEqualTo("leo2@mdd.io");
        assertThat(leo.getPassword()).isEqualTo("OLD_HASH"); // inchangé
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void updateProfile_shouldEncodePasswordWhenProvidedAndValid() {
        when(userRepository.findByUsername("leo")).thenReturn(Optional.of(leo));
        when(userRepository.existsByUsernameAndIdNot("leo", 1L)).thenReturn(false);
        when(userRepository.existsByEmailAndIdNot("leo@mdd.io", 1L)).thenReturn(false);
        when(passwordEncoder.encode("NewPass1!")).thenReturn("NEW_HASH");
        when(topicRepository.findSubscribedByUserId(1L)).thenReturn(List.of());

        userService.updateProfile("leo", new UpdateProfileRequest("leo", "leo@mdd.io", "NewPass1!"));

        assertThat(leo.getPassword()).isEqualTo("NEW_HASH");
    }

    @Test
    void updateProfile_shouldRejectInvalidPassword() {
        when(userRepository.findByUsername("leo")).thenReturn(Optional.of(leo));
        when(userRepository.existsByUsernameAndIdNot("leo", 1L)).thenReturn(false);
        when(userRepository.existsByEmailAndIdNot("leo@mdd.io", 1L)).thenReturn(false);

        assertThatThrownBy(() ->
                userService.updateProfile("leo", new UpdateProfileRequest("leo", "leo@mdd.io", "weak")))
                .isInstanceOf(BadRequestException.class);

        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateProfile_shouldThrowConflictWhenUsernameTaken() {
        when(userRepository.findByUsername("leo")).thenReturn(Optional.of(leo));
        when(userRepository.existsByUsernameAndIdNot("taken", 1L)).thenReturn(true);

        assertThatThrownBy(() ->
                userService.updateProfile("leo", new UpdateProfileRequest("taken", "leo@mdd.io", null)))
                .isInstanceOf(ConflictException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void updateProfile_shouldThrowConflictWhenEmailTaken() {
        when(userRepository.findByUsername("leo")).thenReturn(Optional.of(leo));
        when(userRepository.existsByUsernameAndIdNot("leo", 1L)).thenReturn(false);
        when(userRepository.existsByEmailAndIdNot("taken@mdd.io", 1L)).thenReturn(true);

        assertThatThrownBy(() ->
                userService.updateProfile("leo", new UpdateProfileRequest("leo", "taken@mdd.io", null)))
                .isInstanceOf(ConflictException.class);

        verify(userRepository, never()).save(any());
    }
}