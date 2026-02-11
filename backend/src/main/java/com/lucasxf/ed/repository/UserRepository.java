package com.lucasxf.ed.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

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
}
