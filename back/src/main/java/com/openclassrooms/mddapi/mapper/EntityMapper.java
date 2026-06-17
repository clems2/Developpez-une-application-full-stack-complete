package com.openclassrooms.mddapi.mapper;

import java.util.List;

/**
 * Contrat générique de mapping bidirectionnel entité ↔ DTO.
 * Chaque mapper du projet étend cette interface pour garantir un contrat
 * uniforme : toDto, toEntity et leurs variantes liste sont
 * disponibles sur tous les mappers sans redéclaration.
 *
 * @param <D> type du DTO
 * @param <E> type de l'entité
 */
public interface EntityMapper<D, E> {

    /** Convertit une entité en DTO. */
    D toDto(E entity);

    /** Convertit un DTO en entité. */
    E toEntity(D dto);

    /** Convertit une liste d'entités en liste de DTO. */
    List<D> toDto(List<E> entityList);

    /** Convertit une liste de DTO en liste d'entités. */
    List<E> toEntity(List<D> dtoList);
}