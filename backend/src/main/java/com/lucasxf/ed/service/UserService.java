package com.lucasxf.ed.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.exception.UserNotFoundException;
import com.lucasxf.ed.repository.UserRepository;

import static java.util.Objects.requireNonNull;

/**
 * Service for user account operations.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-03
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = requireNonNull(userRepository);
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
}
