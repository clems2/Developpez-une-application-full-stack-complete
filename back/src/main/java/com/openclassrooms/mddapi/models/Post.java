package com.openclassrooms.mddapi.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

/**
 * Article publié par un utilisateur sur un sujet.
 *
 * L'auteur et la date de création sont définis côté serveur, jamais fournis
 * par le client : createdAt est posé par CreationTimestamp à la
 * persistance et non modifiable ensuite updatable = false. Les deux
 * relations sont en LAZY explicite (chargées à la demande via JOIN FETCH
 * au niveau requête, conformément à open-in-view: false.
 */
@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    // TEXT (et non VARCHAR) : un article peut être long.
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    /**
     * Construit un article à partir de ses champs métier et de ses relations.
     * L'id et la date createdAt sont générés automatiquement.
     *
     * @param title   titre de l'article
     * @param content contenu de l'article
     * @param author  auteur (utilisateur courant)
     * @param topic   sujet associé
     */
    public Post(String title, String content, User author, Topic topic) {
        this.title = title;
        this.content = content;
        this.author = author;
        this.topic = topic;
    }
}