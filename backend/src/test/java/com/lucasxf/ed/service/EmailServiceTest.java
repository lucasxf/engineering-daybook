package com.lucasxf.ed.service;

import java.util.Properties;

import jakarta.mail.Address;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import com.lucasxf.ed.domain.User;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link EmailService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-22
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EmailService")
class EmailServiceTest {

    private static final String FROM_ADDRESS = "noreply@learnimo.net";
    private static final String APP_BASE_URL = "https://learnimo.net";
    private static final String RAW_TOKEN = "raw-token-abc123";

    @Mock
    private JavaMailSender mailSender;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(mailSender, FROM_ADDRESS, APP_BASE_URL);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // sendPasswordResetEmail — happy paths
    // ─────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("sendPasswordResetEmail")
    class SendPasswordResetEmail {

        @Test
        @DisplayName("EN locale — builds English email and sends it")
        void enLocale_sendsEnglishEmail() {
            MimeMessage mimeMessage = realMimeMessage();
            when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

            emailService.sendPasswordResetEmail(userWithLocale("EN"), RAW_TOKEN);

            verify(mailSender).send(mimeMessage);
        }

        @Test
        @DisplayName("PT-BR locale — builds Portuguese email and sends it")
        void ptBrLocale_sendsPtBrEmail() {
            MimeMessage mimeMessage = realMimeMessage();
            when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

            emailService.sendPasswordResetEmail(userWithLocale("PT-BR"), RAW_TOKEN);

            verify(mailSender).send(mimeMessage);
        }

        @Test
        @DisplayName("PT_BR locale variant — normalizes to pt-BR and sends Portuguese email")
        void ptBrUnderscoreVariant_sendsPtBrEmail() {
            MimeMessage mimeMessage = realMimeMessage();
            when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

            emailService.sendPasswordResetEmail(userWithLocale("PT_BR"), RAW_TOKEN);

            verify(mailSender).send(mimeMessage);
        }

        @Test
        @DisplayName("null locale — defaults to EN and sends English email")
        void nullLocale_defaultsToEn() {
            MimeMessage mimeMessage = realMimeMessage();
            when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

            emailService.sendPasswordResetEmail(userWithLocale(null), RAW_TOKEN);

            verify(mailSender).send(mimeMessage);
        }

        @Test
        @DisplayName("unknown locale — defaults to EN and sends English email")
        void unknownLocale_defaultsToEn() {
            MimeMessage mimeMessage = realMimeMessage();
            when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

            emailService.sendPasswordResetEmail(userWithLocale("FR"), RAW_TOKEN);

            verify(mailSender).send(mimeMessage);
        }

        @Test
        @DisplayName("MessagingException from mail infrastructure — wraps into IllegalStateException")
        void messagingException_throwsIllegalStateException() throws MessagingException {
            MimeMessage mockMimeMessage = mock(MimeMessage.class);
            when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);
            doThrow(new MessagingException("SMTP error")).when(mockMimeMessage).setFrom((Address) any());

            assertThatThrownBy(() -> emailService.sendPasswordResetEmail(userWithLocale("EN"), RAW_TOKEN))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Failed to send password reset email");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private MimeMessage realMimeMessage() {
        return new MimeMessage(Session.getInstance(new Properties()));
    }

    private User userWithLocale(String locale) {
        User user = new User("user@example.com", "hash", "Test User", "testuser");
        user.setLocale(locale);
        return user;
    }
}
