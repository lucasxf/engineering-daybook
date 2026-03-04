package com.lucasxf.ed.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.dto.LearnerProfileResponse;
import com.lucasxf.ed.exception.LearnerAccessDeniedException;
import com.lucasxf.ed.exception.LearnerNotFoundException;
import com.lucasxf.ed.repository.PokRepository;

import static java.util.Objects.requireNonNull;

/**
 * Service for public learner profile operations.
 *
 * <p>Enforces the access rules for Milestone 5.2 (Learner Profile Privacy):
 * <ul>
 *   <li>Unknown handles → 404</li>
 *   <li>Private profile visited by non-owner → minimal shell (no personal info)</li>
 *   <li>Public profile or owner's own profile → full profile</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-04
 */
@Service
public class LearnerService {

    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.DESC, "createdAt");
    private static final int PROFILE_PAGE_SIZE = 20;

    private final UserService userService;
    private final PokRepository pokRepository;

    public LearnerService(UserService userService, PokRepository pokRepository) {
        this.userService = requireNonNull(userService);
        this.pokRepository = requireNonNull(pokRepository);
    }

    /**
     * Returns the learner profile for the given handle, as seen by {@code requesterId}.
     *
     * <ul>
     *   <li>Unknown handle → throws {@link LearnerNotFoundException}</li>
     *   <li>Private profile, non-owner → returns private shell</li>
     *   <li>Public profile or owner → returns full profile (owner sees all learnings + learningCount)</li>
     * </ul>
     *
     * @param handle      the target learner's handle
     * @param requesterId the UUID of the requesting user
     * @return the profile response appropriate for the requester
     * @throws LearnerNotFoundException if no learner with that handle exists
     */
    public LearnerProfileResponse getProfile(String handle, UUID requesterId) {
        User target = userService.findByHandle(handle)
            .orElseThrow(() -> new LearnerNotFoundException("Learner not found: @" + handle));

        boolean isOwner = target.getId().equals(requesterId);

        if (!isOwner && target.getProfileVisibility() == User.ProfileVisibility.PRIVATE) {
            return LearnerProfileResponse.privateShell(target.getHandle());
        }

        List<Pok> learnings;
        if (isOwner) {
            learnings = pokRepository
                .findByUserIdAndDeletedAtIsNull(target.getId(),
                    PageRequest.of(0, PROFILE_PAGE_SIZE, DEFAULT_SORT))
                .getContent();
        } else {
            learnings = pokRepository
                .findByUserIdAndVisibilityAndDeletedAtIsNull(target.getId(),
                    Pok.Visibility.PUBLIC, PageRequest.of(0, PROFILE_PAGE_SIZE, DEFAULT_SORT))
                .getContent();
        }

        return LearnerProfileResponse.full(target, learnings, isOwner);
    }

    /**
     * Returns a paginated page of PUBLIC learnings for the given learner handle.
     *
     * <p>The owner always sees all their own learnings (public + private).
     * Non-owners see only PUBLIC learnings; returns 403 if the profile is PRIVATE.
     *
     * @param handle      the target learner's handle
     * @param requesterId the UUID of the requesting user
     * @param page        zero-based page number
     * @param size        page size
     * @return a page of learnings
     * @throws LearnerNotFoundException    if no learner with that handle exists
     * @throws LearnerAccessDeniedException if the profile is PRIVATE and requester is not the owner
     */
    public Page<Pok> getLearnerPoks(String handle, UUID requesterId, int page, int size) {
        User target = userService.findByHandle(handle)
            .orElseThrow(() -> new LearnerNotFoundException("Learner not found: @" + handle));

        boolean isOwner = target.getId().equals(requesterId);

        if (!isOwner && target.getProfileVisibility() == User.ProfileVisibility.PRIVATE) {
            throw new LearnerAccessDeniedException(
                "Profile @" + handle + " is private");
        }

        PageRequest pageable = PageRequest.of(page, size, DEFAULT_SORT);

        if (isOwner) {
            return pokRepository.findByUserIdAndDeletedAtIsNull(target.getId(), pageable);
        }
        return pokRepository.findByUserIdAndVisibilityAndDeletedAtIsNull(
            target.getId(), Pok.Visibility.PUBLIC, pageable);
    }
}
