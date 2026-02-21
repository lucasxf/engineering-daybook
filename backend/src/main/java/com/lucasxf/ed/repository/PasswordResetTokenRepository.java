package com.lucasxf.ed.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.lucasxf.ed.domain.PasswordResetToken;

/**
 * Repository for password reset token persistence.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-21
 */
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    /**
     * Invalidates all pending (unused) tokens for a user before issuing a new one.
     * Ensures only the most recently issued token is valid (FR10).
     */
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.usedAt = CURRENT_TIMESTAMP "
        + "WHERE t.user.id = :userId AND t.usedAt IS NULL")
    void invalidateAllPendingByUserId(UUID userId);

    /**
     * Counts tokens created for a user since the given threshold.
     * Used to enforce the per-email rate limit (FR14): max 3 requests per hour.
     */
    long countByUserIdAndCreatedAtAfter(UUID userId, Instant threshold);
}
