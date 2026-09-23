package com.traveldesk.backend.config;

import com.traveldesk.backend.auth.Role;
import com.traveldesk.backend.auth.User;
import com.traveldesk.backend.auth.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${TRAVORA_ADMIN_USERNAME:}") String adminUsername,
            @Value("${TRAVORA_ADMIN_PASSWORD:}") String adminPassword
    ) {
        return args -> {

            if (adminUsername == null || adminUsername.isBlank()
                    || adminPassword == null || adminPassword.isBlank()) {
                System.out.println("Admin bootstrap skipped: TRAVORA_ADMIN_USERNAME and TRAVORA_ADMIN_PASSWORD are not configured.");
                return;
            }

            User admin = userRepository
                    .findByUsername(adminUsername)
                    .orElse(null);

            if (admin == null) {

                admin = new User();

                admin.setUsername(adminUsername);
                admin.setPassword(
                        passwordEncoder.encode(adminPassword)
                );
                admin.setRole(Role.ADMIN);
                admin.setActive(true);

                userRepository.save(admin);

                System.out.println("Configured ADMIN bootstrap account created: " + adminUsername);

            } else {

                admin.setPassword(
                        passwordEncoder.encode(adminPassword)
                );

                admin.setRole(Role.ADMIN);
                admin.setActive(true);
                admin.setEmployeeId(null);

                userRepository.save(admin);

                System.out.println("Configured ADMIN bootstrap account synchronized: " + adminUsername);
            }
        };
    }
}
