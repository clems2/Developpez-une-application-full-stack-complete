package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.models.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Accès aux données des sujets. Hérite des opérations CRUD de {@link JpaRepository}.
 */
public interface TopicRepository extends JpaRepository<Topic, Long> {
}