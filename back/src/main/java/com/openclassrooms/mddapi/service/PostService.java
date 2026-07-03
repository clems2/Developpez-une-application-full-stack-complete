package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.CommentDto;
import com.openclassrooms.mddapi.dto.CreatePostRequest;
import com.openclassrooms.mddapi.dto.PostDetailDto;
import com.openclassrooms.mddapi.dto.PostDto;
import com.openclassrooms.mddapi.exception.ResourceNotFoundException;
import com.openclassrooms.mddapi.exception.SubscriptionRequiredException;
import com.openclassrooms.mddapi.models.Post;
import com.openclassrooms.mddapi.models.Topic;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.PostRepository;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Logique métier des articles : création (auteur + date côté serveur) et consultation du détail.
 */
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;

    private final CommentService commentService;
    private final SubscriptionService subscriptionService;



    /**
     * Crée un article pour l'utilisateur courant.
     *
     * @param username nom d'utilisateur courant (issu du token), défini comme auteur
     * @param request  titre, contenu et sujet de l'article
     * @return l'article créé
     * @throws ResourceNotFoundException si l'utilisateur ou le sujet est introuvable
     */
    @Transactional
    public PostDto create(String username, CreatePostRequest request) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Topic topic = topicRepository.findById(request.topicId())
                .orElseThrow(() -> new ResourceNotFoundException("Sujet introuvable"));
        if (!subscriptionService.isSubscribed(author.getId(), topic.getId())) {
            throw new SubscriptionRequiredException(
                    "Publication impossible : vous n'êtes pas abonné à ce sujet");
        }
        Post saved = postRepository.save(new Post(request.title(), request.content(), author, topic));
        return toDto(saved);
    }

    /**
     * Récupère le détail d'un article.
     *
     * @param id identifiant de l'article
     * @return l'article
     * @throws ResourceNotFoundException si l'article n'existe pas
     */
    @Transactional(readOnly = true)
    public PostDto getById(Long id) {
        Post post = postRepository.findByIdWithAuthorAndTopic(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article introuvable"));
        return toDto(post);
    }

    /**
     * Détail d'un article, commentaires inclus (ordre chronologique croissant).
     *
     * @param id identifiant de l'article
     * @return le détail de l'article avec ses commentaires
     * @throws ResourceNotFoundException si l'article est introuvable
     */
    @Transactional(readOnly = true)
    public PostDetailDto getPostDetail(Long id) {
        Post post = postRepository.findByIdWithAuthorAndTopic(id)   // réutilise la requête JOIN FETCH de la tranche Post
                .orElseThrow(() -> new ResourceNotFoundException("Article introuvable : " + id));

        List<CommentDto> comments = commentService.getByPostId(id);

        return new PostDetailDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getAuthor().getUsername(),
                post.getCreatedAt(),
                post.getTopic().getTitle(),
                comments
        );
    }
    
    /**
     * Fil d'actualité de l'utilisateur : articles des sujets auxquels il est abonné,
     * triés par date. Le sens de tri est piloté par order (défaut décroissant) ;
     * toute valeur autre que "asc" retombe sur décroissant.
     *
     * @param username username de l'utilisateur authentifié
     * @param order    {@code "asc"} ou {@code "desc"} (défaut)
     * @return les articles du fil en DTO, triés
     */
    @Transactional(readOnly = true)
    public List<PostDto> getFeed(String username, String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, "createdAt");

        return postRepository.findFeedForUser(username, sort)
                .stream()
                .map(this::toDto) 
                .toList();
    }
    /** Construit le DTO d'un article (forme plate auteur/sujet). */
    private PostDto toDto(Post post) {
        return new PostDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getAuthor().getUsername(),
                post.getCreatedAt(),
                post.getTopic().getTitle());
    }
}