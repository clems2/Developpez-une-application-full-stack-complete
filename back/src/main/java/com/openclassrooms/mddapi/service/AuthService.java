package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.AuthResponse;
import com.openclassrooms.mddapi.dto.LoginRequest;
import com.openclassrooms.mddapi.dto.RegisterRequest;
import com.openclassrooms.mddapi.exception.ConflictException;
import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import com.openclassrooms.mddapi.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Logique d'inscription et de connexion.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    /**
     * Inscrit un nouvel utilisateur puis l'authentifie (auto-login).
     *
     * Pré-vérifie l'unicité de l'e-mail et du nom d'utilisateur pour renvoyer
     * un message précis (option A) ; la contrainte d'unicité en base reste le
     * garde-fou ultime. Le mot de passe est encodé en BCrypt avant persistance.
     *
     * @param request données d'inscription validées
     * @return un token JWT pour la session naissante
     * @throws ConflictException si l'e-mail ou le nom d'utilisateur est déjà pris
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Cet e-mail est déjà utilisé");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Ce nom d'utilisateur est déjà utilisé");
        }

        User user = new User(
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password()));
        userRepository.save(user);

        return new AuthResponse(jwtUtil.generateToken(user.getUsername()));
    }

    /**
     * Authentifie un utilisateur par e-mail ou nom d'utilisateur.
     *
     * Délègue la vérification à l'AuthenticationManager (qui résout
     * l'utilisateur via le UserDetailsService et compare le mot de passe
     * BCrypt). Le sujet du token est le nom d'utilisateur canonique retourné par
     * l'authentification.</p>
     *
     * @param request identifiant + mot de passe
     * @return un token JWT
     * @throws org.springframework.security.authentication.BadCredentialsException
     *         si l'identifiant est inconnu ou le mot de passe erroné
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.identifier(), request.password()));

        return new AuthResponse(jwtUtil.generateToken(authentication.getName()));
    }
}