package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.TopicDto;
import com.openclassrooms.mddapi.models.Topic;
import org.mapstruct.Mapper;

/**
 * Mapper entité Topic ↔ TopicDto.
 *
 * Les noms de champs étant identiques (id, title, description), aucun
 * explicite n'est nécessaire.
 */
@Mapper(componentModel = "spring")
public interface TopicMapper extends EntityMapper<TopicDto, Topic> {
}