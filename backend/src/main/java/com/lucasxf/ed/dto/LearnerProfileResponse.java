package com.lucasxf.ed.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;

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
 * @author Lucas Xavier Ferreira
 * @since 2026-03-04
 */
public record LearnerProfileResponse(
    String handle,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    String displayName,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    User.ProfileVisibility profileVisibility,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    List<PokSummary> learnings,

    @JsonInclude(JsonInclude.Include.NON_NULL)
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
     * For owners: {@code learningCount} is the total number of learnings.
     *
     * @param user      the learner's User entity
     * @param learnings the list of learnings to expose
     * @param isOwner   whether the requesting user is the owner of this profile
     * @return a full profile response
     */
    public static LearnerProfileResponse full(User user, List<Pok> learnings, boolean isOwner) {
        List<PokSummary> summaries = learnings.stream()
            .map(p -> new PokSummary(p.getId(), p.getTitle(), p.getContent(),
                isOwner ? p.getVisibility() : null, p.getCreatedAt()))
            .toList();
        Integer count = isOwner ? learnings.size() : null;
        return new LearnerProfileResponse(user.getHandle(), user.getDisplayName(), null, summaries, count);
    }

    /**
     * Minimal POK summary for profile listing.
     *
     * <p>{@code visibility} is only included for the profile owner (visibility badge).
     */
    public record PokSummary(
        UUID id,
        @JsonInclude(JsonInclude.Include.NON_NULL) String title,
        String content,
        @JsonInclude(JsonInclude.Include.NON_NULL) Pok.Visibility visibility,
        Instant createdAt) {}
}
