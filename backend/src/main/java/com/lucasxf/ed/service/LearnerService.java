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
import com.lucasxf.ed.dto.RelationshipStatus;
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
 * <p>Enforces access rules for Milestones 5.2 and 6.1:
 * <ul>
 *   <li>Unknown handles → 404</li>
 *   <li>Profile visibility gated by follow tier: PRIVATE, COLLEAGUES_ONLY, FOLLOWERS_ONLY, PUBLIC</li>
 *   <li>POK listing filtered by viewer's relationship level</li>
 *   <li>Social counts (followers, following, colleagues) exposed to owner only (anti-vanity rule)</li>
 *   <li>Relationship status (NONE/FOLLOWING/FOLLOWED_BY/COLLEAGUE) exposed to non-owners only</li>
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
    private final FollowService followService;

    public LearnerService(UserService userService, PokRepository pokRepository,
                          PokTagRepository pokTagRepository, UserTagRepository userTagRepository,
                          FollowService followService) {
        this.userService = requireNonNull(userService);
        this.pokRepository = requireNonNull(pokRepository);
        this.pokTagRepository = requireNonNull(pokTagRepository);
        this.userTagRepository = requireNonNull(userTagRepository);
        this.followService = requireNonNull(followService);
    }

    /**
     * Returns the learner profile for the given handle, as seen by {@code requesterId}.
     *
     * <ul>
     *   <li>Unknown handle → throws {@link LearnerNotFoundException}</li>
     *   <li>Profile visibility does not permit access → private shell</li>
     *   <li>Owner → full profile with all learnings, learningCount, and social counts</li>
     *   <li>Non-owner with access → full profile with relationship status; no social counts</li>
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

        if (!isOwner && !hasProfileAccess(requesterId, target)) {
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
            List<Pok.Visibility> visibleTiers = getVisiblePoktiers(requesterId, target.getId());
            learnings = pokRepository
                .findByUserIdAndVisibilityInAndDeletedAtIsNull(target.getId(),
                    visibleTiers, PageRequest.of(0, PROFILE_PAGE_SIZE, DEFAULT_SORT))
                .getContent();
            totalCount = null;
        }

        Long followerCount = null;
        Long followingCount = null;
        Long colleagueCount = null;
        RelationshipStatus relationship = null;

        if (isOwner) {
            followerCount = followService.countFollowers(target.getId());
            followingCount = followService.countFollowing(target.getId());
            colleagueCount = followService.countColleagues(target.getId());
        } else {
            relationship = followService.getRelationship(requesterId, target.getId());
        }

        return LearnerProfileResponse.full(
            target, learnings, isOwner, totalCount,
            relationship, followerCount, followingCount, colleagueCount);
    }

    /**
     * Returns a paginated page of learnings for the given learner handle, mapped to DTOs.
     *
     * <p>The owner always sees all their own learnings. Non-owners see only the learnings
     * whose visibility tier permits access (PUBLIC, FOLLOWERS_ONLY for followers, etc.).
     * Tags are always built from the owner's tag set.
     *
     * @param handle      the target learner's handle
     * @param requesterId the UUID of the requesting user
     * @param page        zero-based page number
     * @param size        page size
     * @return a page of {@link PokResponse} DTOs
     * @throws LearnerNotFoundException     if no learner with that handle exists
     * @throws LearnerAccessDeniedException if the profile visibility denies access
     */
    public Page<PokResponse> getLearnerPoks(String handle, UUID requesterId, int page, int size) {
        User target = userService.findByHandle(handle)
            .orElseThrow(() -> new LearnerNotFoundException("Learner not found: @" + handle));

        boolean isOwner = target.getId().equals(requesterId);

        if (!isOwner && !hasProfileAccess(requesterId, target)) {
            throw new LearnerAccessDeniedException("Profile @" + handle + " is private");
        }

        PageRequest pageable = PageRequest.of(page, size, DEFAULT_SORT);

        // Pre-fetch the owner's tags once to avoid N+1 queries across the page
        List<UserTag> ownerTags = userTagRepository.findByUserIdAndDeletedAtIsNull(target.getId());

        Page<Pok> poks;
        if (isOwner) {
            poks = pokRepository.findByUserIdAndDeletedAtIsNull(target.getId(), pageable);
        } else {
            List<Pok.Visibility> visibleTiers = getVisiblePoktiers(requesterId, target.getId());
            poks = pokRepository.findByUserIdAndVisibilityInAndDeletedAtIsNull(
                target.getId(), visibleTiers, pageable);
        }

        return poks.map(pok -> PokResponse.from(pok, buildTagResponses(pok.getId(), ownerTags), List.of()));
    }

    /**
     * Returns whether {@code requesterId} has access to view the given learner's full profile,
     * based on the learner's profile visibility setting and the requester's follow relationship.
     *
     * @param requesterId the requesting user's ID
     * @param target      the target learner
     * @return true if the requester is allowed to see the full profile
     */
    private boolean hasProfileAccess(UUID requesterId, User target) {
        return switch (target.getProfileVisibility()) {
            case PUBLIC -> true;
            case FOLLOWERS_ONLY -> followService.isFollowing(requesterId, target.getId());
            case COLLEAGUES_ONLY -> followService.areColleagues(requesterId, target.getId());
            case PRIVATE -> false;
        };
    }

    /**
     * Returns the list of POK visibility tiers that {@code requesterId} can see on a profile
     * belonging to {@code ownerId}.
     *
     * <p>Access levels:
     * <ul>
     *   <li>Colleague (mutual follow) → PUBLIC + FOLLOWERS_ONLY + COLLEAGUES_ONLY</li>
     *   <li>Follower (follows but not followed back) → PUBLIC + FOLLOWERS_ONLY</li>
     *   <li>Non-follower → PUBLIC only</li>
     * </ul>
     *
     * @param requesterId the requesting user's ID
     * @param ownerId     the profile owner's ID
     * @return list of visibility tiers the requester can access
     */
    private List<Pok.Visibility> getVisiblePoktiers(UUID requesterId, UUID ownerId) {
        if (followService.areColleagues(requesterId, ownerId)) {
            return List.of(Pok.Visibility.PUBLIC, Pok.Visibility.FOLLOWERS_ONLY, Pok.Visibility.COLLEAGUES_ONLY);
        }
        if (followService.isFollowing(requesterId, ownerId)) {
            return List.of(Pok.Visibility.PUBLIC, Pok.Visibility.FOLLOWERS_ONLY);
        }
        return List.of(Pok.Visibility.PUBLIC);
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
