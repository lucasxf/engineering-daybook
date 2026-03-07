package com.lucasxf.ed.dto;

/**
 * Relationship status between the requesting learner and a target learner.
 *
 * <ul>
 *   <li>{@code NONE} — no follow relationship in either direction</li>
 *   <li>{@code FOLLOWING} — requester follows target, but target does not follow back</li>
 *   <li>{@code FOLLOWED_BY} — target follows requester, but requester does not follow target</li>
 *   <li>{@code COLLEAGUE} — mutual follow (requester and target follow each other)</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 6.1
 */
public enum RelationshipStatus {
    NONE, FOLLOWING, FOLLOWED_BY, COLLEAGUE
}
