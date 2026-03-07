package com.lucasxf.ed.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for learner profile queries.
 *
 * <p>Two shapes are returned depending on context:
 * <ul>
 *   <li><b>Private shell</b> (non-owner, profile access denied): only {@code handle} and
 *       {@code profileVisibility}. All other fields are null and omitted from JSON.</li>
 *   <li><b>Full profile</b> (owner or non-owner with access): {@code handle}, {@code displayName},
 *       {@code avatarUrl}, {@code bio}, and {@code learnings}. Social counts appear for the
 *       owner only (anti-vanity rule). {@code relationshipStatus} appears for non-owners only.</li>
 * </ul>
 *
 * @author lucasxf
 * @since 5.2
 */
@Schema(description = "Learner profile response — either a private shell or a full profile depending on visibility rules")
public record LearnerProfileResponse(

    @Schema(description = "The learner's unique handle", example = "lucasxf")
    String handle,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "The learner's display name — null in private shell responses", example = "Lucas Xavier")
    String displayName,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Profile visibility setting — present only in private shell responses to signal the profile is private")
    User.ProfileVisibility profileVisibility,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "List of the learner's learnings — null in private shell responses")
    List<PokSummary> learnings,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Total number of learnings — populated for the profile owner only (anti-vanity rule)")
    Integer learningCount,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Relationship between the requesting user and this learner — NONE/FOLLOWING/FOLLOWED_BY/COLLEAGUE; null for profile owner (use FollowButton to show own counts)")
    RelationshipStatus relationshipStatus,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Number of followers — owner only (anti-vanity rule)")
    Long followerCount,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Number of learners this user follows — owner only (anti-vanity rule)")
    Long followingCount,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Number of colleagues (mutual follows) — owner only (anti-vanity rule)")
    Long colleagueCount,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Avatar URL — null in private shell responses and when no avatar is set")
    String avatarUrl,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Short bio — null in private shell responses and when no bio is set")
    String bio) {

    /**
     * Creates a minimal private shell — confirms the handle exists, reveals nothing else.
     *
     * @param handle the learner's handle
     * @return a private shell response
     */
    public static LearnerProfileResponse privateShell(String handle) {
        return new LearnerProfileResponse(
            handle, null, User.ProfileVisibility.PRIVATE, null, null, null, null, null, null, null, null);
    }

    /**
     * Creates a full profile response.
     *
     * <p>For non-owners: social counts are null (anti-vanity rule); {@code relationshipStatus}
     * contains the requester's relationship to this learner.
     * For owners: social counts are populated; {@code relationshipStatus} is null.
     *
     * @param user             the learner's User entity
     * @param learnings        the list of learnings to expose (may be a paged subset)
     * @param isOwner          whether the requesting user is the owner of this profile
     * @param learningCount    accurate total learning count — non-null for owner, null for non-owners
     * @param relationship     NONE/FOLLOWING/FOLLOWED_BY/COLLEAGUE — null for owner
     * @param followerCount    follower count — non-null for owner, null for non-owners
     * @param followingCount   following count — non-null for owner, null for non-owners
     * @param colleagueCount   colleague count — non-null for owner, null for non-owners
     * @return a full profile response
     */
    public static LearnerProfileResponse full(
            User user, List<Pok> learnings, boolean isOwner, Integer learningCount,
            RelationshipStatus relationship, Long followerCount, Long followingCount, Long colleagueCount) {
        List<PokSummary> summaries = learnings.stream()
            .map(p -> new PokSummary(p.getId(), p.getTitle(), p.getContent(),
                isOwner ? p.getVisibility() : null, p.getCreatedAt()))
            .toList();
        return new LearnerProfileResponse(
            user.getHandle(),
            user.getDisplayName(),
            null,
            summaries,
            isOwner ? learningCount : null,
            isOwner ? null : relationship,
            isOwner ? followerCount : null,
            isOwner ? followingCount : null,
            isOwner ? colleagueCount : null,
            user.getAvatarUrl(),
            user.getBio());
    }

    /**
     * Minimal POK summary for profile listing.
     *
     * <p>{@code visibility} is only included for the profile owner (visibility badge).
     */
    @Schema(description = "Minimal learning summary included in profile responses")
    public record PokSummary(
        @Schema(description = "Learning unique identifier") UUID id,
        @JsonInclude(JsonInclude.Include.NON_NULL) @Schema(description = "Learning title — null if untitled") String title,
        @Schema(description = "Learning content") String content,
        @JsonInclude(JsonInclude.Include.NON_NULL) @Schema(description = "Visibility of this learning — present for profile owner only") Pok.Visibility visibility,
        @Schema(description = "Creation timestamp (UTC)") Instant createdAt) {}
}
