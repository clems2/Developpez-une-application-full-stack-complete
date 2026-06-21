package com.openclassrooms.mddapi.security;

import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Résolution de l'utilisateur pour Spring Security lors de la connexion.
 *
 * <p>S'appuie sur l'implémentation {@code UserDetails} fournie par Spring
 * (plus de classe maison, sur recommandation mentor) : le MVP n'a besoin que du
 * nom d'utilisateur, du mot de passe et d'autorités vides.</p>
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Charge un utilisateur à partir d'un identifiant pouvant être l'e-mail
     * ou le nom d'utilisateur (la spec autorise les deux à la connexion).
     *
     * Le UserDetails retourné porte toujours le nom d'utilisateur canonique (et non l'identifiant saisi) : c'est cette
     * valeur qui alimentera le sujet du token.</p>
     *
     * @param identifier e-mail ou nom d'utilisateur saisi à la connexion
     * @return les détails de sécurité de l'utilisateur résolu
     * @throws UsernameNotFoundException si aucun compte ne correspond
     */
    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Aucun utilisateur ne correspond à l'identifiant fourni"));
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(AuthorityUtils.NO_AUTHORITIES)
                .build();
    }
}