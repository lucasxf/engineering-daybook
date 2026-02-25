package com.lucasxf.ed.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.lucasxf.ed.domain.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.requireNonNull;

/**
 * Service for sending transactional emails via JavaMailSender (SMTP).
 *
 * <p>The base URL used in reset links is configurable via the {@code APP_BASE_URL}
 * environment variable, defaulting to {@code https://learnimo.net}. This allows
 * the service to work correctly across all active domains (e.g. learnimo.com.br).
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-21
 */
@Slf4j
@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String appBaseUrl;

    public EmailService(JavaMailSender mailSender,
                        @Value("${MAIL_FROM:noreply@learnimo.net}") String fromAddress,
                        @Value("${APP_BASE_URL:https://learnimo.net}") String appBaseUrl) {
        this.mailSender = requireNonNull(mailSender);
        this.fromAddress = requireNonNull(fromAddress);
        this.appBaseUrl = requireNonNull(appBaseUrl);
    }

    /**
     * Sends a password reset email to the user.
     * The raw token is embedded in the reset link. It is never logged or stored.
     *
     * @param user     the recipient (email, locale, and display name are used)
     * @param rawToken the raw (unhashed) token to include in the reset link
     */
    public void sendPasswordResetEmail(User user, String rawToken) {
        String locale = normalizeLocale(user.getLocale());
        String resetLink = appBaseUrl + "/" + locale + "/reset-password?token=" + rawToken;

        boolean isPtBr = "pt-BR".equals(locale);

        String subject = isPtBr
            ? "Redefinição de senha — learnimo"
            : "Password reset — learnimo";

        String body = isPtBr
            ? buildPtBrEmailBody(user.getDisplayName(), resetLink)
            : buildEnEmailBody(user.getDisplayName(), resetLink);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
            log.info("Password reset email sent: handle={}", user.getHandle());
        } catch (MessagingException e) {
            log.error("Failed to send password reset email: handle={}", user.getHandle(), e);
            throw new IllegalStateException("Failed to send password reset email", e);
        }
    }

    private String normalizeLocale(String locale) {
        if (locale == null) return "en";
        return switch (locale.toUpperCase()) {
            case "PT-BR", "PT_BR" -> "pt-BR";
            default -> "en";
        };
    }

    private String buildEnEmailBody(String displayName, String resetLink) {
        return """
            <html><body style="font-family: sans-serif; max-width: 480px; margin: auto;">
            <h2>Password reset</h2>
            <p>Hi %s,</p>
            <p>We received a request to reset your learnimo password.
               Click the button below to set a new password. This link expires in 1 hour.</p>
            <p><a href="%s" style="display:inline-block;padding:10px 20px;background:#2563eb;
               color:#fff;border-radius:6px;text-decoration:none;">Reset my password</a></p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>— The learnimo team</p>
            </body></html>
            """.formatted(displayName, resetLink);
    }

    private String buildPtBrEmailBody(String displayName, String resetLink) {
        return """
            <html><body style="font-family: sans-serif; max-width: 480px; margin: auto;">
            <h2>Redefinição de senha</h2>
            <p>Olá %s,</p>
            <p>Recebemos uma solicitação para redefinir sua senha do learnimo.
               Clique no botão abaixo para definir uma nova senha. Este link expira em 1 hora.</p>
            <p><a href="%s" style="display:inline-block;padding:10px 20px;background:#2563eb;
               color:#fff;border-radius:6px;text-decoration:none;">Redefinir minha senha</a></p>
            <p>Se você não solicitou a redefinição de senha, pode ignorar este e-mail com segurança.</p>
            <p>— A equipe learnimo</p>
            </body></html>
            """.formatted(displayName, resetLink);
    }
}
