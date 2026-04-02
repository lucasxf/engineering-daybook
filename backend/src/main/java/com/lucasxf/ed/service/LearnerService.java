package com.lucasxf.ed.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.PokShare;
import com.lucasxf.ed.domain.PokTag;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.domain.UserTag;
import com.lucasxf.ed.dto.FeedItemResponse;
import com.lucasxf.ed.dto.LearnerProfileResponse;
import com.lucasxf.ed.dto.LearnerSearchResult;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.dto.PokShareResponse;
import com.lucasxf.ed.dto.RelationshipStatus;
import com.lucasxf.ed.dto.TagResponse;
import com.lucasxf.ed.exception.LearnerAccessDeniedException;
import com.lucasxf.ed.exception.LearnerNotFoundException;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokShareRepository;
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
    private final PokShareRepository pokShareRepository;
    private final PokTagRepository pokTagRepository;
    private final UserTagRepository userTagRepository;
    private final FollowService followService;

    public LearnerService(UserService userService, PokRepository pokRepository,
                          PokShareRepository pokShareRepository,
                          PokTagRepository pokTagRepository, UserTagRepository userTagRepository,
                          FollowService followService) {
        this.userService = requireNonNull(userService);
        this.pokRepository = requireNonNull(pokRepository);
        this.pokShareRepository = requireNonNull(pokShareRepository);
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
     * <p>For non-owners, the follow relationship is computed exactly once via
     * {@link FollowService#getRelationship} and reused for both access gating and
     * POK visibility-tier filtering — avoiding redundant DB round-trips.
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

        if (isOwner) {
            List<Pok> learnings = pokRepository
                .findByUserIdAndDeletedAtIsNull(target.getId(),
                    PageRequest.of(0, PROFILE_PAGE_SIZE, DEFAULT_SORT))
                .getContent();
            int totalCount = (int) pokRepository.countByUserIdAndDeletedAtIsNull(target.getId());

            Long followerCount = followService.countFollowers(target.getId());
            Long followingCount = followService.countFollowing(target.getId());
            Long colleagueCount = followService.countColleagues(target.getId());

            return LearnerProfileResponse.full(
                target, learnings, true, totalCount,
                null, followerCount, followingCount, colleagueCount);
        }

        // Non-owner: PRIVATE profiles short-circuit before any follow DB query
        if (target.getProfileVisibility() == User.ProfileVisibility.PRIVATE) {
            return LearnerProfileResponse.privateShell(target.getHandle());
        }

        // Compute relationship once — reused for access check, tier filtering, and DTO field
        RelationshipStatus relationship = followService.getRelationship(requesterId, target.getId());

        if (!hasProfileAccess(target, relationship)) {
            return LearnerProfileResponse.privateShell(target.getHandle());
        }

        List<Pok.Visibility> visibleTiers = getVisiblePokTiers(relationship);
        List<Pok> learnings = pokRepository
            .findByUserIdAndVisibilityInAndDeletedAtIsNull(target.getId(),
                visibleTiers, PageRequest.of(0, PROFILE_PAGE_SIZE, DEFAULT_SORT))
            .getContent();

        return LearnerProfileResponse.full(
            target, learnings, false, null,
            relationship, null, null, null);
    }

    /**
     * Returns a paginated page of learnings and re-learnings for the given learner handle.
     *
     * <p>Owned POKs and re-learnings are fetched with a bounded {@link PageRequest} (enough rows
     * to correctly populate the requested page), merged in memory, sorted by {@code createdAt DESC},
     * and sliced. Separate COUNT queries provide the accurate total for pagination controls.
     *
     * <p>The fetch bound is {@code (page + 1) * size} per source, which guarantees that
     * the merged in-memory sort produces the correct items for page {@code page}: any item
     * that belongs in positions {@code [0, (page+1)*size)} of the full sorted union must be
     * within the top {@code (page+1)*size} of one of the two sources.
     *
     * <p>The owner sees all their items. Non-owners see only items whose visibility
     * tier permits access based on their relationship with the target learner.
     *
     * @param handle      the target learner's handle
     * @param requesterId the UUID of the requesting user
     * @param page        zero-based page number
     * @param size        page size
     * @return a page of {@link FeedItemResponse} items
     * @throws LearnerNotFoundException     if no learner with that handle exists
     * @throws LearnerAccessDeniedException if the profile visibility denies access
     */
    public Page<FeedItemResponse> getLearnerPoks(String handle, UUID requesterId, int page, int size) {
        User target = userService.findByHandle(handle)
            .orElseThrow(() -> new LearnerNotFoundException("Learner not found: @" + handle));

        boolean isOwner = target.getId().equals(requesterId);

        // Bounded fetch: load only enough rows to satisfy this page.
        // Fetching top (page+1)*size per source (sorted DESC) guarantees the merged
        // result is accurate for all positions up to (page+1)*size in the full union.
        int fetchLimit = Math.max((page + 1) * size, size);
        Pageable bounded = PageRequest.of(0, fetchLimit, Sort.by(Sort.Direction.DESC, "createdAt"));

        List<Pok> poks;
        List<PokShare> shares;
        long total;

        // TODO(perf): The merge strategy below fetches up to (page+1)*size rows from each
        // source separately, merges and sorts in memory, then slices. This bounds memory to
        // O((page+1)*size) per source (vs. Pageable.unpaged()), but a DB-level UNION query
        // with a single ORDER BY + LIMIT would be more efficient for large page offsets.
        // Tracked in Milestone 6.5 / Phase 4.
        if (isOwner) {
            poks = pokRepository.findByUserIdAndDeletedAtIsNull(target.getId(), bounded).getContent();
            shares = pokShareRepository.findBySharedByUserId(target.getId(), bounded).getContent();
            total = pokRepository.countByUserIdAndDeletedAtIsNull(target.getId())
                + pokShareRepository.countBySharedByUserId(target.getId());
        } else {
            // Non-owner: PRIVATE profiles short-circuit before any follow DB query
            if (target.getProfileVisibility() == User.ProfileVisibility.PRIVATE) {
                throw new LearnerAccessDeniedException("Profile @" + handle + " is private");
            }

            // Compute relationship once — reused for access check and tier filtering
            RelationshipStatus relationship = followService.getRelationship(requesterId, target.getId());
            if (!hasProfileAccess(target, relationship)) {
                throw new LearnerAccessDeniedException("Profile @" + handle + " is private");
            }

            List<Pok.Visibility> visibleTiers = getVisiblePokTiers(relationship);
            poks = pokRepository.findByUserIdAndVisibilityInAndDeletedAtIsNull(
                target.getId(), visibleTiers, bounded).getContent();
            shares = pokShareRepository.findBySharedByUserIdAndVisibilityIn(
                target.getId(), visibleTiers, bounded).getContent();
            total = pokRepository.countByUserIdAndVisibilityInAndDeletedAtIsNull(target.getId(), visibleTiers)
                + pokShareRepository.countBySharedByUserIdAndVisibilityIn(target.getId(), visibleTiers);
        }

        // Pre-fetch the owner's tags and usage counts once to avoid N+1 queries across the page
        List<UserTag> ownerTags = userTagRepository.findByUserIdAndDeletedAtIsNull(target.getId());
        Map<UUID, Long> countMap = pokTagRepository.countPoksByTagForUser(target.getId()).stream()
            .collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));

        // Build feed items — owned POKs
        List<FeedItemResponse> feedItems = new ArrayList<>();
        for (Pok pok : poks) {
            feedItems.add(PokResponse.from(pok, buildTagResponses(pok.getId(), ownerTags, countMap), List.of()));
        }

        // Append re-learnings (batch-fetch originals to avoid N+1)
        if (!shares.isEmpty()) {
            Set<UUID> originalPokIds = shares.stream()
                .map(PokShare::getOriginalPokId)
                .collect(Collectors.toSet());
            Map<UUID, Pok> originalsById = pokRepository.findAllById(originalPokIds).stream()
                .collect(Collectors.toMap(Pok::getId, p -> p));

            String targetHandle = target.getHandle();
            for (PokShare share : shares) {
                Pok original = originalsById.get(share.getOriginalPokId());
                if (original != null) {
                    feedItems.add(PokShareResponse.from(share, PokResponse.from(original), targetHandle));
                }
            }
        }

        // Sort by createdAt DESC and in-memory paginate
        feedItems.sort(Comparator.comparing(FeedItemResponse::createdAt).reversed());

        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, feedItems.size());
        List<FeedItemResponse> pageContent = fromIndex >= feedItems.size()
            ? List.of()
            : feedItems.subList(fromIndex, toIndex);

        return new PageImpl<>(pageContent, PageRequest.of(page, size), total);
    }

    /**
     * Searches for PUBLIC learners by handle or display name.
     *
     * <p>Returns an empty page for queries shorter than 2 characters. Visibility enforcement
     * is delegated to the data layer (NFR7). Relationship status is resolved per result so the
     * frontend can render Follow/Unfollow buttons without additional requests.
     *
     * @param q           the search term (case-insensitive substring)
     * @param requesterId the ID of the authenticated caller
     * @param page        zero-based page number
     * @param size        page size
     * @return a page of {@link LearnerSearchResult} items ordered by display name
     */
    public Page<LearnerSearchResult> searchLearners(String q, UUID requesterId, int page, int size) {
        if (q == null || q.trim().length() < 2) {
            return Page.empty(PageRequest.of(page, size));
        }
        // Self is excluded at DB layer; all results are other users
        Page<User> userPage = userService.searchPublicLearners(q.trim(), requesterId, PageRequest.of(page, size));

        // Collect target IDs for bulk relationship resolution (avoids N+1)
        Set<UUID> targetIds = userPage.getContent().stream()
            .map(User::getId)
            .collect(Collectors.toSet());

        // Bulk-resolve relationships in 2 queries regardless of page size
        Map<UUID, RelationshipStatus> relationships = targetIds.isEmpty()
            ? Map.of()
            : followService.getRelationships(requesterId, targetIds);

        List<LearnerSearchResult> results = userPage.getContent().stream()
            .map(user -> LearnerSearchResult.from(user, relationships.get(user.getId())))
            .toList();

        return new PageImpl<>(results, userPage.getPageable(), userPage.getTotalElements());
    }

    /**
     * Returns whether the requester (identified by their pre-computed {@code relationship}) has
     * access to view the given learner's full profile.
     *
     * <p>PRIVATE profiles should be short-circuited before calling this method — they never
     * reach here. The PRIVATE branch is kept as a safe default for completeness.
     *
     * @param target       the target learner
     * @param relationship the pre-computed relationship from requester to target
     * @return true if the requester is allowed to see the full profile
     */
    private boolean hasProfileAccess(User target, RelationshipStatus relationship) {
        return switch (target.getProfileVisibility()) {
            case PUBLIC -> true;
            case FOLLOWERS_ONLY ->
                relationship == RelationshipStatus.FOLLOWING || relationship == RelationshipStatus.COLLEAGUE;
            case COLLEAGUES_ONLY -> relationship == RelationshipStatus.COLLEAGUE;
            case PRIVATE -> false;
        };
    }

    /**
     * Returns the list of POK visibility tiers that a requester with the given
     * {@code relationship} can see on a non-owner profile.
     *
     * <p>Access levels:
     * <ul>
     *   <li>COLLEAGUE (mutual follow) → PUBLIC + FOLLOWERS_ONLY + COLLEAGUES_ONLY</li>
     *   <li>FOLLOWING (follows but not followed back) → PUBLIC + FOLLOWERS_ONLY</li>
     *   <li>FOLLOWED_BY or NONE → PUBLIC only</li>
     * </ul>
     *
     * @param relationship the pre-computed relationship from requester to target
     * @return list of visibility tiers the requester can access
     */
    private List<Pok.Visibility> getVisiblePokTiers(RelationshipStatus relationship) {
        return switch (relationship) {
            case COLLEAGUE ->
                List.of(Pok.Visibility.PUBLIC, Pok.Visibility.FOLLOWERS_ONLY, Pok.Visibility.COLLEAGUES_ONLY);
            case FOLLOWING ->
                List.of(Pok.Visibility.PUBLIC, Pok.Visibility.FOLLOWERS_ONLY);
            default -> List.of(Pok.Visibility.PUBLIC);
        };
    }

    /**
     * Builds the tag response list for a single POK from pre-fetched owner tags and usage counts.
     *
     * @param pokId     the POK's ID
     * @param ownerTags the pre-fetched active tags belonging to the POK owner
     * @param countMap  tag ID → number of non-deleted POKs using that tag (for the owner)
     * @return list of {@link TagResponse} for the POK's assigned tags
     */
    private List<TagResponse> buildTagResponses(UUID pokId, List<UserTag> ownerTags, Map<UUID, Long> countMap) {
        return pokTagRepository.findByPokId(pokId).stream()
            .map(PokTag::getTagId)
            .flatMap(tagId -> ownerTags.stream()
                .filter(ut -> ut.getTag().getId() != null && ut.getTag().getId().equals(tagId)))
            .map(ut -> TagResponse.from(ut, countMap.getOrDefault(ut.getTag().getId(), 0L).intValue()))
            .toList();
    }
}
