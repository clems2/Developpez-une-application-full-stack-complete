package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.models.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Charge les commentaires d'un article, du plus ancien au plus récent,
     * avec l'auteur préchargé en JOIN FETCH pour éviter le N+1 lors de la construction des DTO.
     *
     * @param postId identifiant de l'article
     * @return les commentaires ordonnés par date de création croissante
     */
    @Query("""
           SELECT c FROM Comment c
           JOIN FETCH c.author
           WHERE c.post.id = :postId
           ORDER BY c.createdAt ASC
           """)
    List<Comment> findByPostIdWithAuthorOrderByCreatedAtAsc(@Param("postId") Long postId);
}