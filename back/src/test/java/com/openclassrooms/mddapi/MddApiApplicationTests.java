package com.openclassrooms.mddapi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * <p>Épinglé sur le profil {@code test} (H2 en mémoire) pour rester reproductible
 * sans MySQL local ni Docker, en CI comme sur une machine vierge.</p>
 */
@SpringBootTest
@ActiveProfiles("test")
class MddApiApplicationTests {

    @Test
    void contextLoads() {
    }

}