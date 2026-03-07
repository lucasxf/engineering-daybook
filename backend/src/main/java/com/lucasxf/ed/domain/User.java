package com.lucasxf.ed.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

/**
 * User entity representing an authenticated application user.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(nullable = false, unique = true, length = 30)
    private String handle;

    @Column(nullable = false, length = 10)
    private String locale = "EN";

    @Column(nullable = false, length = 10)
    private String theme = "dark";

    @Column(name = "auth_provider", nullable = false, length = 20)
    private String authProvider = "local";

    @Enumerated(EnumType.STRING)
    @Column(name = "default_pok_visibility", nullable = false, length = 20)
    private Pok.Visibility defaultPokVisibility = Pok.Visibility.PRIVATE;

    @Enumerated(EnumType.STRING)
    @Column(name = "profile_visibility", nullable = false, length = 20)
    private ProfileVisibility profileVisibility = ProfileVisibility.PRIVATE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected User() {
        // JPA requires a no-arg constructor
    }

    public User(String email, String passwordHash, String displayName, String handle) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.handle = handle;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getHandle() {
        return handle;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }

    public Pok.Visibility getDefaultPokVisibility() {
        return defaultPokVisibility;
    }

    public void setDefaultPokVisibility(Pok.Visibility defaultPokVisibility) {
        this.defaultPokVisibility = defaultPokVisibility;
    }

    public ProfileVisibility getProfileVisibility() {
        return profileVisibility;
    }

    public void setProfileVisibility(ProfileVisibility profileVisibility) {
        this.profileVisibility = profileVisibility;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Visibility level for a learner's public profile.
     *
     * <p>Ordered from most restrictive to most open — mirrors {@link Pok.Visibility} ordering.
     *
     * <ul>
     *   <li>{@code PRIVATE} — only the owner sees the full profile.</li>
     *   <li>{@code COLLEAGUES_ONLY} — mutual follows (colleagues) see the full profile.</li>
     *   <li>{@code FOLLOWERS_ONLY} — anyone who follows the learner sees the full profile.</li>
     *   <li>{@code PUBLIC} — any authenticated user sees the full profile.</li>
     * </ul>
     */
    public enum ProfileVisibility {
        PRIVATE,
        COLLEAGUES_ONLY,
        FOLLOWERS_ONLY,
        PUBLIC
    }
}
