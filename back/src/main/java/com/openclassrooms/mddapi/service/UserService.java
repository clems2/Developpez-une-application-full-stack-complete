package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.TopicDto;
import com.openclassrooms.mddapi.dto.UpdateProfileRequest;
import com.openclassrooms.mddapi.dto.UserProfileDto;
import com.openclassrooms.mddapi.exception.BadRequestException;
import com.openclassrooms.mddapi.exception.ConflictException;
import com.openclassrooms.mddapi.exception.ResourceNotFoundException;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import com.openclassrooms.mddapi.security.PasswordPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Logique métier du profil utilisateur : consultation et mise à jour.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Retourne le profil de l'utilisateur authentifié (infos + abonnements).
     *
     * @param username username issu du token
     * @return le profil et ses abonnements
     * @throws ResourceNotFoundException si l'utilisateur est introuvable
     */
    @Transactional(readOnly = true)
    public UserProfileDto getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + username));
        return buildProfile(user);
    }

    /**
     * Met à jour le profil. username et email sont remplacés ;
     * leur unicité est vérifiée en excluant le compte courant (sinon resauvegarder
     * sa propre valeur déclencherait un faux conflit). Le mot de passe n'est touché
     * que s'il est fourni non vide, après validation de la règle de complexité.
     *
     * @param username username courant (issu du token)
     * @param request  nouvelles valeurs (password optionnel)
     * @return le profil mis à jour
     * @throws ResourceNotFoundException si l'utilisateur est introuvable
     * @throws ConflictException         si username/email est déjà pris par un autre compte
     * @throws BadRequestException       si un mot de passe fourni ne respecte pas la règle
     */
    @Transactional
    public UserProfileDto updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + username));

        if (userRepository.existsByUsernameAndIdNot(request.username(), user.getId())) {
            throw new ConflictException("Ce nom d'utilisateur est déjà utilisé.");
        }
        if (userRepository.existsByEmailAndIdNot(request.email(), user.getId())) {
            throw new ConflictException("Cette adresse e-mail est déjà utilisée.");
        }

        if (request.password() != null && !request.password().isBlank()) {
            if (!request.password().matches(PasswordPolicy.REGEX)) {
                throw new BadRequestException(PasswordPolicy.MESSAGE);
            }
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        user.setUsername(request.username());
        user.setEmail(request.email());
        userRepository.save(user);

        return buildProfile(user);
    }

    /** Assemble le DTO de profil : infos utilisateur + abonnements (filtrés par id stable). */
    private UserProfileDto buildProfile(User user) {
        List<TopicDto> subscriptions = topicRepository.findSubscribedByUserId(user.getId())
                .stream()
                .map(t -> new TopicDto(t.getId(), t.getTitle(), t.getDescription(), true))
                .toList();
        return new UserProfileDto(user.getId(), user.getUsername(), user.getEmail(), subscriptions);
    }
}