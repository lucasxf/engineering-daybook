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
 *   <li><b>Private shell</b> (non-owner, private profile): only {@code handle} and
 *       {@code profileVisibility}. All other fields are null and omitted from JSON.</li>
 *   <li><b>Full profile</b> (owner or non-owner on public profile): {@code handle},
 *       {@code displayName}, and {@code learnings}. {@code learningCount} is only
 *       included for the owner (anti-vanity rule).</li>
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
    Integer learningCount) {

    /**
     * Creates a minimal private shell — confirms the handle exists, reveals nothing else.
     *
     * @param handle the learner's handle
     * @return a private shell response
     */
    public static LearnerProfileResponse privateShell(String handle) {
        return new LearnerProfileResponse(handle, null, User.ProfileVisibility.PRIVATE, null, null);
    }

    /**
     * Creates a full profile response.
     *
     * <p>For non-owners: {@code learningCount} is null (anti-vanity rule).
     * For owners: {@code learningCount} is the caller-supplied accurate total, which must come
     * from a dedicated count query rather than being derived from the (possibly paged)
     * {@code learnings} list.
     *
     * @param user          the learner's User entity
     * @param learnings     the list of learnings to expose (may be a paged subset)
     * @param isOwner       whether the requesting user is the owner of this profile
     * @param learningCount the accurate total learning count — must be non-null when
     *                      {@code isOwner} is {@code true}, ignored (null) for non-owners
     * @return a full profile response
     */
    public static LearnerProfileResponse full(
            User user, List<Pok> learnings, boolean isOwner, Integer learningCount) {
        List<PokSummary> summaries = learnings.stream()
            .map(p -> new PokSummary(p.getId(), p.getTitle(), p.getContent(),
                isOwner ? p.getVisibility() : null, p.getCreatedAt()))
            .toList();
        Integer count = isOwner ? learningCount : null;
        return new LearnerProfileResponse(user.getHandle(), user.getDisplayName(), null, summaries, count);
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
