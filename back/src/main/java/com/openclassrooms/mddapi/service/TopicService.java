package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.TopicDto;
import com.openclassrooms.mddapi.mapper.TopicMapper;
import com.openclassrooms.mddapi.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 *
 * Service concret pour les endpoints manipulant les objets Topic
 */
@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final TopicMapper topicMapper;

    /**
     * Récupère l'ensemble des sujets disponibles, convertis en DTO.
     *
     * @return la liste des sujets (vide si aucun)
     */
    public List<TopicDto> findAll() {
        return topicMapper.toDto(topicRepository.findAll());
    }
}