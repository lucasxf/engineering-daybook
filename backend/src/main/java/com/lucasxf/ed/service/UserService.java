package com.lucasxf.ed.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.exception.UserNotFoundException;
import com.lucasxf.ed.repository.FollowRepository;
import com.lucasxf.ed.repository.PokAuditLogRepository;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokShareRepository;
import com.lucasxf.ed.repository.PokTagRepository;
import com.lucasxf.ed.repository.RefreshTokenRepository;
import com.lucasxf.ed.repository.UserRepository;
import com.lucasxf.ed.repository.UserTagRepository;

import static java.util.Objects.requireNonNull;

/**
 * Service for user account operations.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-03
 */
@Service
public class UserService {

    private static final Set<String> VALID_THEMES = Set.of("light", "dark", "system");
    private static final Set<String> VALID_LOCALES = Set.of("en", "EN", "pt-BR");

    private final UserRepository userRepository;
    private final PokRepository pokRepository;
    private final PokTagRepository pokTagRepository;
    private final PokAuditLogRepository pokAuditLogRepository;
    private final PokShareRepository pokShareRepository;
    private final FollowRepository followRepository;
    private final UserTagRepository userTagRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final StorageService storageService;

    public UserService(
            UserRepository userRepository,
            PokRepository pokRepository,
            PokTagRepository pokTagRepository,
            PokAuditLogRepository pokAuditLogRepository,
            PokShareRepository pokShareRepository,
            FollowRepository followRepository,
            UserTagRepository userTagRepository,
            RefreshTokenRepository refreshTokenRepository,
            StorageService storageService) {
        this.userRepository = requireNonNull(userRepository);
        this.pokRepository = requireNonNull(pokRepository);
        this.pokTagRepository = requireNonNull(pokTagRepository);
        this.pokAuditLogRepository = requireNonNull(pokAuditLogRepository);
        this.pokShareRepository = requireNonNull(pokShareRepository);
        this.followRepository = requireNonNull(followRepository);
        this.userTagRepository = requireNonNull(userTagRepository);
        this.refreshTokenRepository = requireNonNull(refreshTokenRepository);
        this.storageService = requireNonNull(storageService);
    }

    /**
     * Returns the user with the given ID.
     *
     * @param userId the user's UUID
     * @return the User entity
     * @throws UserNotFoundException if no user exists with that ID
     */
    public User findById(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));
    }

    /**
     * Returns the user with the given handle, or empty if not found.
     *
     * @param handle the user's unique handle
     * @return an Optional containing the User, or empty
     */
    public Optional<User> findByHandle(String handle) {
        return userRepository.findByHandle(handle);
    }

    /**
     * Searches for PUBLIC learners whose handle or display name contains the given term.
     *
     * <p>The requesting user is excluded from results so they never see themselves.
     *
     * @param q           the search term (caller must ensure length >= 2)
     * @param requesterId the ID of the caller, excluded from results
     * @param pageable    pagination parameters
     * @return a page of matching users ordered by display name
     */
    public Page<User> searchPublicLearners(String q, UUID requesterId, Pageable pageable) {
        return userRepository.searchPublicByHandleOrDisplayName(q, requesterId, pageable);
    }

    /**
     * Updates the default POK visibility preference for a user.
     *
     * <p>Only affects future learnings — existing POKs are not retroactively changed.
     *
     * @param userId     the user's UUID
     * @param visibility the new default visibility
     * @throws UserNotFoundException if no user exists with that ID
     */
    @Transactional
    public void updateDefaultPokVisibility(UUID userId, Pok.Visibility visibility) {
        User user = findById(userId);
        user.setDefaultPokVisibility(visibility);
        userRepository.save(user);
    }

    /**
     * Updates the profile visibility preference for a user.
     *
     * @param userId     the user's UUID
     * @param visibility the new profile visibility
     * @throws UserNotFoundException if no user exists with that ID
     */
    @Transactional
    public void updateProfileVisibility(UUID userId, User.ProfileVisibility visibility) {
        User user = findById(userId);
        user.setProfileVisibility(visibility);
        userRepository.save(user);
    }

    /**
     * Updates the bio for a user.
     *
     * <p>A {@code null} bio clears the existing value. Non-null bios are validated to
     * contain no URLs ({@code http://}, {@code https://}, or {@code www.}).
     *
     * @param userId the user's UUID
     * @param bio    the new bio text, or {@code null} to clear
     * @throws IllegalArgumentException if the bio contains a URL
     * @throws UserNotFoundException    if no user exists with that ID
     */
    @Transactional
    public void updateBio(UUID userId, String bio) {
        if (bio != null && (bio.contains("http://") || bio.contains("https://") || bio.contains("www."))) {
            throw new IllegalArgumentException("Bio must not contain URLs");
        }
        User user = findById(userId);
        user.setBio(bio);
        userRepository.save(user);
    }

    /**
     * Updates the display name for a user.
     *
     * @param userId      the user's UUID
     * @param displayName the new display name (must not be blank)
     * @throws IllegalArgumentException if the display name is blank
     * @throws UserNotFoundException    if no user exists with that ID
     */
    @Transactional
    public void updateDisplayName(UUID userId, String displayName) {
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("Display name must not be blank");
        }
        User user = findById(userId);
        user.setDisplayName(displayName);
        userRepository.save(user);
    }

    /**
     * Updates the avatar URL for a user.
     *
     * <p>A {@code null} URL clears the existing avatar.
     *
     * @param userId    the user's UUID
     * @param avatarUrl the new avatar URL, or {@code null} to clear
     * @throws UserNotFoundException if no user exists with that ID
     */
    @Transactional
    public void updateAvatarUrl(UUID userId, String avatarUrl) {
        User user = findById(userId);
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
    }

    /**
     * Updates the theme preference for a user.
     *
     * @param userId the user's UUID
     * @param theme  the new theme value (e.g. "light", "dark", "system")
     * @throws UserNotFoundException if no user exists with that ID
     */
    @Transactional
    public void updateTheme(UUID userId, String theme) {
        if (!VALID_THEMES.contains(theme)) {
            throw new IllegalArgumentException("Theme must be one of: light, dark, system");
        }
        User user = findById(userId);
        user.setTheme(theme);
        userRepository.save(user);
    }

    /**
     * Updates the locale preference for a user.
     *
     * @param userId the user's UUID
     * @param locale the new locale value (e.g. "EN", "pt-BR")
     * @throws UserNotFoundException if no user exists with that ID
     */
    @Transactional
    public void updateLocale(UUID userId, String locale) {
        if (!VALID_LOCALES.contains(locale)) {
            throw new IllegalArgumentException("Locale must be one of: EN, pt-BR");
        }
        User user = findById(userId);
        user.setLocale(locale);
        userRepository.save(user);
    }

    /**
     * Permanently deletes the authenticated user's account.
     *
     * <p>Cascade-deletes all associated data in a safe order, removes the avatar
     * blob from storage, then anonymises the user row (soft-delete via {@code deleted_at}).
     *
     * <p>Idempotent: if the user has already been deleted (or never existed),
     * the method returns immediately without error.
     *
     * @param userId the UUID of the user to delete
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteAccount(UUID userId) {
        Optional<User> maybeUser = userRepository.findById(userId);
        if (maybeUser.isEmpty()) {
            return;
        }
        User user = maybeUser.get();

        // Collect POK IDs before deleting (needed for per-POK cascade steps)
        List<UUID> pokIds = pokRepository.findIdsByUserId(userId);

        // 1. PokShare by user
        pokShareRepository.deleteAllBySharedByUserId(userId);

        // 2. PokShare by POK
        if (!pokIds.isEmpty()) {
            pokShareRepository.deleteByOriginalPokIdIn(pokIds);
        }

        // 3. Follow (both directions)
        followRepository.deleteAllByFollowerId(userId);
        followRepository.deleteAllByFollowedId(userId);

        // 4. PokTag per POK
        if (!pokIds.isEmpty()) {
            pokTagRepository.deleteByPokIdIn(pokIds);
        }

        // 5. PokAuditLog per POK
        if (!pokIds.isEmpty()) {
            pokAuditLogRepository.deleteByPokIdIn(pokIds);
        }

        // 6. POKs
        pokRepository.deleteAllByUserId(userId);

        // 7. UserTag
        userTagRepository.deleteAllByUserId(userId);

        // 8. RefreshToken
        refreshTokenRepository.deleteAllByUserId(userId);

        // 9. Avatar blob (no-op when absent)
        storageService.delete(userId);

        // 10. Anonymise and soft-delete the user row
        anonymizeUser(user);
    }

    /**
     * Anonymises a user row in preparation for soft-deletion.
     *
     * <p>Replaces all personally-identifying fields with opaque placeholders and
     * sets {@code deleted_at} to the current instant.
     *
     * @param user the user entity to anonymise
     */
    private void anonymizeUser(User user) {
        String id = user.getId().toString();
        user.setEmail("deleted-" + id + "@deleted.learnimo.net");
        user.setHandle("deleted_" + id.replace("-", "_"));
        user.setDisplayName("[deleted]");
        user.setBio(null);
        user.setAvatarUrl(null);
        user.setPasswordHash(null);
        user.setDeletedAt(Instant.now());
        userRepository.save(user);
    }
}
