package com.lucasxf.ed.domain;

import java.io.Serializable;
import java.util.UUID;

/**
 * Composite primary key for the {@link Follow} entity.
 *
 * @author Lucas Xavier Ferreira
 * @since 6.1
 */
public record FollowId(UUID followerId, UUID followedId) implements Serializable {}
