package com.lucasxf.ed.config;

import java.util.Collections;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

/**
 * Configuration for Google OAuth ID token verification.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-13
 */
@Configuration
public class GoogleOAuthConfig {

    @Bean
    public GoogleIdTokenVerifier googleIdTokenVerifier(AuthProperties authProperties) {
        return new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(authProperties.google().clientId()))
            .build();
    }
}
