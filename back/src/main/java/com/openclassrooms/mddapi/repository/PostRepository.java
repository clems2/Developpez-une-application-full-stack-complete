package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.models.Post;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
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

    /**
     * Charge le fil d'un utilisateur : les articles des sujets auxquels il est abonné,
     * avec auteur et sujet préchargés en JOIN FETCH (anti N+1). L'ordre est
     * porté par le Sort passé en paramètre (tri asc/desc sans requête dupliquée).
     *
     * @param username username de l'utilisateur authentifié
     * @param sort     ordre de tri (sur {@code createdAt})
     * @return les articles du fil, triés selon {@code sort}
     */
    @Query("""
        SELECT p FROM Post p
        JOIN FETCH p.author
        JOIN FETCH p.topic
        WHERE p.topic.id IN (
            SELECT s.topic.id FROM Subscription s
            WHERE s.user.username = :username
        )
        """)
    List<Post> findFeedForUser(@Param("username") String username, Sort sort);
}