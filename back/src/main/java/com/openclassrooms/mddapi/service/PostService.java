package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.CreatePostRequest;
import com.openclassrooms.mddapi.dto.PostDto;
import com.openclassrooms.mddapi.exception.ResourceNotFoundException;
import com.openclassrooms.mddapi.models.Post;
import com.openclassrooms.mddapi.models.Topic;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.PostRepository;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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