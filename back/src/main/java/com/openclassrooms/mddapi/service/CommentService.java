package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.CommentDto;
import com.openclassrooms.mddapi.dto.CreateCommentRequest;
import com.openclassrooms.mddapi.exception.ResourceNotFoundException;
import com.openclassrooms.mddapi.models.Comment;
import com.openclassrooms.mddapi.models.Post;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.CommentRepository;
import com.openclassrooms.mddapi.repository.PostRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Logique métier des commentaires : création (auteur/date serveur) et lecture
 * ordonnée des commentaires d'un article.
 */
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /**
     * Crée un commentaire sur un article. L'auteur est résolu depuis le username
     * authentifié et la date posée par la persistance — aucun des deux n'est fourni
     * par le client.
     *
     * @param postId   article commenté
     * @param username username de l'utilisateur authentifié (issu du token)
     * @param request  contenu du commentaire
     * @return le commentaire créé, auteur et date résolus
     * @throws ResourceNotFoundException si l'article ou l'utilisateur est introuvable
     */
    @Transactional
    public CommentDto create(Long postId, String username, CreateCommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Article introuvable : " + postId));
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + username));

        Comment comment = new Comment();
        comment.setContent(request.content());
        comment.setPost(post);
        comment.setAuthor(author);

        return toDto(commentRepository.save(comment));
    }

    /**
     * Retourne les commentaires d'un article, du plus ancien au plus récent.
     *
     * @param postId identifiant de l'article
     * @return les commentaires en DTO, ordre chronologique croissant
     */
    @Transactional(readOnly = true)
    public List<CommentDto> getByPostId(Long postId) {
        return commentRepository.findByPostIdWithAuthorOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    /** Construit le DTO de lecture (author = username), projection asymétrique sans MapStruct. */
    private CommentDto toDto(Comment comment) {
        return new CommentDto(
                comment.getId(),
                comment.getContent(),
                comment.getAuthor().getUsername(),
                comment.getCreatedAt()
        );
    }
}