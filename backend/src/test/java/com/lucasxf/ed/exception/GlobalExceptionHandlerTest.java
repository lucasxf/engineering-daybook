package com.lucasxf.ed.exception;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link GlobalExceptionHandler}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-21
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("GlobalExceptionHandler")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @Mock
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/api/v1/test");
    }

    @Test
    @DisplayName("handleAuthentication should return 401 with message")
    void handleAuthentication_returns401() {
        var ex = new AuthenticationException("Bad credentials");

        ResponseEntity<ApiError> response = handler.handleAuthentication(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Bad credentials");
    }

    @Test
    @DisplayName("handleResourceConflict should return 409 with message")
    void handleResourceConflict_returns409() {
        var ex = new ResourceConflictException("Email already taken");

        ResponseEntity<ApiError> response = handler.handleResourceConflict(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Email already taken");
    }

    @Test
    @DisplayName("handleInvalidToken should return 401")
    void handleInvalidToken_returns401() {
        var ex = new InvalidTokenException("Token expired");

        ResponseEntity<ApiError> response = handler.handleInvalidToken(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Token expired");
    }

    @Test
    @DisplayName("handleValidationException should return 400 with field error details")
    void handleValidationException_returns400() {
        var bindingResult = mock(BindingResult.class);
        var ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors())
            .thenReturn(List.of(new FieldError("req", "email", "must not be blank")));

        ResponseEntity<ApiError> response = handler.handleValidationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().details()).containsExactly("email: must not be blank");
    }

    @Test
    @DisplayName("handleIllegalArgument with 'already' in message should return 409")
    void handleIllegalArgument_alreadyMessage_returns409() {
        var ex = new IllegalArgumentException("Handle is already taken");

        ResponseEntity<ApiError> response = handler.handleIllegalArgument(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("handleIllegalArgument with 'invalid' in message should return 401")
    void handleIllegalArgument_invalidMessage_returns401() {
        var ex = new IllegalArgumentException("Invalid token provided");

        ResponseEntity<ApiError> response = handler.handleIllegalArgument(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("handleIllegalArgument with unrecognized message should return 400")
    void handleIllegalArgument_otherMessage_returns400() {
        var ex = new IllegalArgumentException("Something went wrong");

        ResponseEntity<ApiError> response = handler.handleIllegalArgument(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("handleIllegalArgument with null message should return 400")
    void handleIllegalArgument_nullMessage_returns400() {
        var ex = new IllegalArgumentException((String) null);

        ResponseEntity<ApiError> response = handler.handleIllegalArgument(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("handlePokNotFound should return 404")
    void handlePokNotFound_returns404() {
        var ex = new PokNotFoundException("POK not found");

        ResponseEntity<ApiError> response = handler.handlePokNotFound(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("POK not found");
    }

    @Test
    @DisplayName("handlePokAccessDenied should return 403")
    void handlePokAccessDenied_returns403() {
        var ex = new PokAccessDeniedException("Access denied");

        ResponseEntity<ApiError> response = handler.handlePokAccessDenied(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Access denied");
    }

    @Test
    @DisplayName("handleDataIntegrityViolation should return 409 with generic message")
    void handleDataIntegrityViolation_returns409() {
        var ex = new DataIntegrityViolationException("duplicate key value violates unique constraint");

        ResponseEntity<ApiError> response = handler.handleDataIntegrityViolation(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Resource already exists");
    }

    @Test
    @DisplayName("handleGenericException should return 500 with generic message")
    void handleGenericException_returns500() {
        var ex = new RuntimeException("Unexpected failure");

        ResponseEntity<ApiError> response = handler.handleGenericException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("An unexpected error occurred");
    }
}
