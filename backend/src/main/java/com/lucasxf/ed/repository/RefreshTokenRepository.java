package com.lucasxf.ed.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.lucasxf.ed.domain.RefreshToken;

/**
 * Data access for {@link RefreshToken} entities.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revokedAt = CURRENT_TIMESTAMP WHERE r.user.id = :userId AND r.revokedAt IS NULL")
    void revokeAllByUserId(UUID userId);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.revokedAt IS NOT NULL AND r.revokedAt < :before")
    void deleteRevokedBefore(Instant before);
}
