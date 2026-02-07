package com.lucasxf.ed.controller;

import com.lucasxf.ed.dto.HealthResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health check endpoint for monitoring and load balancers.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-01-29
 */
@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    @GetMapping
    @Operation(
        summary = "Check API health",
        description = "Returns OK if the API is running and ready to accept requests"
    )
    @ApiResponse(responseCode = "200", description = "API is healthy")
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(
            new HealthResponse("OK", "Engineering Daybook API is running")
        );
    }
}
