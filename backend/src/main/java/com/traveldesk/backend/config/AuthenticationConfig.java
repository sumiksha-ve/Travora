package com.traveldesk.backend.config;

import com.traveldesk.backend.auth.UserRepository;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthenticationConfig {

    @Bean
    public UserDetailsService userDetailsService(
            UserRepository userRepository
    ) {

        return username ->
                userRepository
                        .findByUsername(username)
                        .map(user ->
                                org.springframework.security.core.userdetails.User
                                        .withUsername(user.getUsername())
                                        .password(user.getPassword())
                                        .roles(user.getRole().name())
                                        .disabled(!user.isActive())
                                        .build()
                        )
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "User not found: " + username
                                )
                        );
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                        userDetailsService
                );

        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }
}