package com.openclassrooms.mddapi.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Sujet du monde du développement informatique auquel un utilisateur peut s'abonner (ex. Java, Angular).
 *
 * Le titre est unique : deux sujets ne peuvent pas porter le même nom.
 * L'abonnement (relation N-N avec l'utilisateur) sera ajouté avec l'entité
 * User, lors de la mise en place des autres endpoints.
 */
@Entity
@Table(name = "topics")
@Getter
@Setter
@NoArgsConstructor
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    /**
     * Construit un sujet à partir de son titre et de sa description.
     * @param title       titre unique du sujet
     * @param description description du sujet
     */
    public Topic(String title, String description) {
        this.title = title;
        this.description = description;
    }
}