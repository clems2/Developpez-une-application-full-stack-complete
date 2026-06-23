package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.TopicDto;
import com.openclassrooms.mddapi.models.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper entité Topic ↔ TopicDto.
 *
 * Le champ subscribed est volontairement ignoré : il est par-utilisateur
 * et calculé dans le service, hors du périmètre d'un mapper pur. toDto reste
 * fourni par le contrat EntityMapper mais n'est pas utilisé pour produire les
 * sujets exposés par l'API (qui passent par le service).
 */
@Mapper(componentModel = "spring")
public interface TopicMapper extends EntityMapper<TopicDto, Topic> {

    @Override
    @Mapping(target = "subscribed", ignore = true)
    TopicDto toDto(Topic entity);
}