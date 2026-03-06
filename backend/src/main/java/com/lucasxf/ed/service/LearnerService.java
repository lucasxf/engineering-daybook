package com.lucasxf.ed.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.PokTag;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.domain.UserTag;
import com.lucasxf.ed.dto.LearnerProfileResponse;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.dto.TagResponse;
import com.lucasxf.ed.exception.LearnerAccessDeniedException;
import com.lucasxf.ed.exception.LearnerNotFoundException;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokTagRepository;
import com.lucasxf.ed.repository.UserTagRepository;

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
    private final PokTagRepository pokTagRepository;
    private final UserTagRepository userTagRepository;

    public LearnerService(UserService userService, PokRepository pokRepository,
                          PokTagRepository pokTagRepository, UserTagRepository userTagRepository) {
        this.userService = requireNonNull(userService);
        this.pokRepository = requireNonNull(pokRepository);
        this.pokTagRepository = requireNonNull(pokTagRepository);
        this.userTagRepository = requireNonNull(userTagRepository);
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
        Integer totalCount;
        if (isOwner) {
            learnings = pokRepository
                .findByUserIdAndDeletedAtIsNull(target.getId(),
                    PageRequest.of(0, PROFILE_PAGE_SIZE, DEFAULT_SORT))
                .getContent();
            totalCount = (int) pokRepository.countByUserIdAndDeletedAtIsNull(target.getId());
        } else {
            learnings = pokRepository
                .findByUserIdAndVisibilityAndDeletedAtIsNull(target.getId(),
                    Pok.Visibility.PUBLIC, PageRequest.of(0, PROFILE_PAGE_SIZE, DEFAULT_SORT))
                .getContent();
            totalCount = null;
        }

        return LearnerProfileResponse.full(target, learnings, isOwner, totalCount);
    }

    /**
     * Returns a paginated page of learnings for the given learner handle, mapped to DTOs.
     *
     * <p>The owner always sees all their own learnings (public + private).
     * Non-owners see only PUBLIC learnings; returns 403 if the profile is PRIVATE.
     * Tags are always built from the owner's tag set, not the requester's.
     *
     * @param handle      the target learner's handle
     * @param requesterId the UUID of the requesting user
     * @param page        zero-based page number
     * @param size        page size
     * @return a page of {@link PokResponse} DTOs
     * @throws LearnerNotFoundException     if no learner with that handle exists
     * @throws LearnerAccessDeniedException if the profile is PRIVATE and requester is not the owner
     */
    public Page<PokResponse> getLearnerPoks(String handle, UUID requesterId, int page, int size) {
        User target = userService.findByHandle(handle)
            .orElseThrow(() -> new LearnerNotFoundException("Learner not found: @" + handle));

        boolean isOwner = target.getId().equals(requesterId);

        if (!isOwner && target.getProfileVisibility() == User.ProfileVisibility.PRIVATE) {
            throw new LearnerAccessDeniedException(
                "Profile @" + handle + " is private");
        }

        PageRequest pageable = PageRequest.of(page, size, DEFAULT_SORT);

        // Pre-fetch the owner's tags once to avoid N+1 queries across the page
        List<UserTag> ownerTags = userTagRepository.findByUserIdAndDeletedAtIsNull(target.getId());

        Page<Pok> poks = isOwner
            ? pokRepository.findByUserIdAndDeletedAtIsNull(target.getId(), pageable)
            : pokRepository.findByUserIdAndVisibilityAndDeletedAtIsNull(
                target.getId(), Pok.Visibility.PUBLIC, pageable);

        return poks.map(pok -> PokResponse.from(pok, buildTagResponses(pok.getId(), ownerTags), List.of()));
    }

    /**
     * Builds the tag response list for a single POK from a pre-fetched list of the owner's tags.
     *
     * @param pokId     the POK's ID
     * @param ownerTags the pre-fetched active tags belonging to the POK owner
     * @return list of {@link TagResponse} for the POK's assigned tags
     */
    private List<TagResponse> buildTagResponses(UUID pokId, List<UserTag> ownerTags) {
        return pokTagRepository.findByPokId(pokId).stream()
            .map(PokTag::getTagId)
            .flatMap(tagId -> ownerTags.stream()
                .filter(ut -> ut.getTag().getId() != null && ut.getTag().getId().equals(tagId)))
            .map(TagResponse::from)
            .toList();
    }
}
