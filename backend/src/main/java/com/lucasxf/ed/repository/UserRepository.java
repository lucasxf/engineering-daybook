package com.lucasxf.ed.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lucasxf.ed.domain.User;

/**
 * Data access for {@link User} entities.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByHandle(String handle);

    boolean existsByEmail(String email);

    boolean existsByHandle(String handle);

    Optional<User> findByAppleSub(String appleSub);

    boolean existsByAppleSub(String appleSub);

    /**
     * Searches for learners with {@code PUBLIC} profile visibility whose handle or display name
     * contains the given query string (case-insensitive, substring match).
     *
     * <p>The requesting user is excluded from results so they never see themselves in the list.
     * Results are ordered alphabetically by {@code display_name}.
     * Powered by the trigram GIN indexes added in V21 migration.
     *
     * @param q           the search term (caller must ensure length >= 2)
     * @param requesterId the ID of the caller, excluded from results
     * @param pageable    pagination parameters (sort is ignored; ordering is hardcoded)
     * @return a page of matching users (never includes the requester)
     */
    @Query(value = """
            SELECT * FROM users
            WHERE profile_visibility = 'PUBLIC'
              AND id <> :requesterId
              AND (handle ILIKE CONCAT('%', :q, '%')
                   OR display_name ILIKE CONCAT('%', :q, '%'))
            ORDER BY display_name ASC
            """,
           countQuery = """
            SELECT COUNT(*) FROM users
            WHERE profile_visibility = 'PUBLIC'
              AND id <> :requesterId
              AND (handle ILIKE CONCAT('%', :q, '%')
                   OR display_name ILIKE CONCAT('%', :q, '%'))
            """,
           nativeQuery = true)
    Page<User> searchPublicByHandleOrDisplayName(@Param("q") String q,
                                                 @Param("requesterId") UUID requesterId,
                                                 Pageable pageable);
}
