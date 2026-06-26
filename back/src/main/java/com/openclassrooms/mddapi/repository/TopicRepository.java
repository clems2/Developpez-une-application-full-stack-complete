package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.models.Topic;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Accès aux données des sujets. Hérite des opérations CRUD de JpaRepository.
 */
public interface TopicRepository extends JpaRepository<Topic, Long> {

    /**
 * Retourne les sujets auxquels l'utilisateur (par id) est abonné, triés par titre.
 * Filtrage par id (clé stable) plutôt que par username, pour rester correct
 * même quand le username vient d'être modifié dans la transaction courante.
 * Pas de JOIN FETCH : Topic n'a aucune relation lazy déréférencée
 * lors du mapping en DTO.
 *
 * @param userId identifiant de l'utilisateur
 * @return les sujets abonnés, ordonnés par titre
 */
@Query("""
       SELECT s.topic FROM Subscription s
       WHERE s.user.id = :userId
       ORDER BY s.topic.title
       """)
List<Topic> findSubscribedByUserId(@Param("userId") Long userId);
}