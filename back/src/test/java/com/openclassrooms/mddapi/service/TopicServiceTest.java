package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.TopicDto;
import com.openclassrooms.mddapi.mapper.TopicMapper;
import com.openclassrooms.mddapi.models.Topic;
import com.openclassrooms.mddapi.repository.TopicRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires du TopicService : logique de délégation au repository
 * et au mapper, sans contexte Spring (Mockito pur).
 */
@ExtendWith(MockitoExtension.class)
class TopicServiceTest {

    @Mock
    private TopicRepository topicRepository;

    @Mock
    private TopicMapper topicMapper;

    @InjectMocks
    private TopicService topicService;

    @Test
    void findAll_shouldReturnMappedTopics() {
        // Given : le repository renvoie deux entités, le mapper les convertit
        List<Topic> entities = List.of(
                new Topic("Java", "Langage orienté objet sur la JVM"),
                new Topic("Angular", "Framework front-end TypeScript"));
        List<TopicDto> dtos = List.of(
                new TopicDto(1L, "Java", "Langage orienté objet sur la JVM"),
                new TopicDto(2L, "Angular", "Framework front-end TypeScript"));
        when(topicRepository.findAll()).thenReturn(entities);
        when(topicMapper.toDto(entities)).thenReturn(dtos);

        // When
        List<TopicDto> result = topicService.findAll();

        // Then : on retourne bien le résultat mappé, dans l'ordre
        assertThat(result).hasSize(2);
        assertThat(result).extracting(TopicDto::title).containsExactly("Java", "Angular");
        verify(topicRepository).findAll();
        verify(topicMapper).toDto(entities);
    }

    @Test
    void findAll_shouldReturnEmptyListWhenNoTopic() {
        // Given : aucune donnée. Cas limite : on vérifie qu'on ne crashe pas
        // et qu'on renvoie une liste vide plutôt que null.
        when(topicRepository.findAll()).thenReturn(List.of());
        when(topicMapper.toDto(List.<Topic>of())).thenReturn(List.of());

        // When
        List<TopicDto> result = topicService.findAll();

        // Then
        assertThat(result).isEmpty();
        verify(topicMapper).toDto(List.<Topic>of());
    }
}