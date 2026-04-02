package com.lucasxf.ed.dto;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;

/**
 * Request body for {@code PATCH /api/v1/users/me/settings}.
 *
 * <p>All fields are optional; only non-null values are applied.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-04
 */
public record UpdateUserSettingsRequest(
        Pok.Visibility defaultPokVisibility,
        User.ProfileVisibility profileVisibility,
        String bio,
        String displayName,
        String theme,
        String locale) {}
