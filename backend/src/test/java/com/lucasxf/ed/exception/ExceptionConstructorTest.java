package com.lucasxf.ed.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests covering the secondary constructors of domain exception classes.
 *
 * <p>Each exception exposes both a message-only constructor (tested elsewhere via
 * service/controller tests) and either a no-arg or a {@code (String, Throwable)}
 * constructor whose lines are not yet exercised by any existing test.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
@DisplayName("Exception constructors")
class ExceptionConstructorTest {

    @Nested
    @DisplayName("PokNotFoundException")
    class PokNotFoundExceptionTests {

        @Test
        @DisplayName("no-arg constructor sets default message")
        void noArgConstructor_setsDefaultMessage() {
            PokNotFoundException ex = new PokNotFoundException();

            assertThat(ex.getMessage()).isEqualTo("POK not found");
        }
    }

    @Nested
    @DisplayName("PokAccessDeniedException")
    class PokAccessDeniedExceptionTests {

        @Test
        @DisplayName("no-arg constructor sets default message")
        void noArgConstructor_setsDefaultMessage() {
            PokAccessDeniedException ex = new PokAccessDeniedException();

            assertThat(ex.getMessage()).isEqualTo("You do not have permission to access this POK");
        }
    }

    @Nested
    @DisplayName("ResourceConflictException")
    class ResourceConflictExceptionTests {

        @Test
        @DisplayName("message-and-cause constructor preserves both values")
        void messageAndCauseConstructor_preservesBothValues() {
            Throwable cause = new RuntimeException("root cause");

            ResourceConflictException ex = new ResourceConflictException("Email already taken", cause);

            assertThat(ex.getMessage()).isEqualTo("Email already taken");
            assertThat(ex.getCause()).isSameAs(cause);
        }
    }

    @Nested
    @DisplayName("AuthenticationException")
    class AuthenticationExceptionTests {

        @Test
        @DisplayName("message-and-cause constructor preserves both values")
        void messageAndCauseConstructor_preservesBothValues() {
            Throwable cause = new RuntimeException("token expired");

            AuthenticationException ex = new AuthenticationException("Bad credentials", cause);

            assertThat(ex.getMessage()).isEqualTo("Bad credentials");
            assertThat(ex.getCause()).isSameAs(cause);
        }
    }
}
