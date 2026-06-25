package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.models.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

/**
 * Accès aux données des articles.
 */
public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * Charge un article avec son auteur et son sujet déjà résolus (un seul aller-retour).
     */
    @Query("select p from Post p join fetch p.author join fetch p.topic where p.id = :id")
    Optional<Post> findByIdWithAuthorAndTopic(@Param("id") Long id);
}