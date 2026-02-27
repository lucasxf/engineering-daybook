package com.lucasxf.ed.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Optional request body for the token refresh endpoint.
 *
 * <p>Mobile clients (which cannot store httpOnly cookies) send the refresh token
 * in the request body. Web clients continue to use the {@code refresh_token}
 * httpOnly cookie and do not need to send a body.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-27
 */
@Schema(description = "Optional refresh token in request body — mobile clients only")
public record RefreshRequest(
    @Schema(description = "Opaque refresh token obtained from a prior login or refresh response")
    String refreshToken
) {}
