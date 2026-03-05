package com.lucasxf.ed.controller;

import java.util.List;
import java.util.UUID;

import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.dto.LearnerProfileResponse;
import com.lucasxf.ed.exception.LearnerAccessDeniedException;
import com.lucasxf.ed.exception.LearnerNotFoundException;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.JwtService;
import com.lucasxf.ed.service.LearnerService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.util.ReflectionTestUtils.setField;

/**
 * Integration tests for {@link LearnerController}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-04
 */
@WebMvcTest(LearnerController.class)
@Import(SecurityConfig.class)
@EnableConfigurationProperties(CorsProperties.class)
class LearnerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LearnerService learnerService;

    @MockitoBean
    private JwtService jwtService;

    private final UUID requesterId = UUID.randomUUID();
    private final UUID aliceId = UUID.randomUUID();

    private User makeAlice(User.ProfileVisibility profileVisibility) {
        User alice = new User("alice@example.com", "hash", "Alice", "alice");
        setField(alice, "id", aliceId);
        alice.setProfileVisibility(profileVisibility);
        return alice;
    }

    private Pok makePublicPok() {
        Pok pok = new Pok(aliceId, "Title", "content", Pok.Visibility.PUBLIC);
        setField(pok, "id", UUID.randomUUID());
        return pok;
    }

    // ===== GET /api/v1/learners/{handle} =====

    @Test
    void getProfile_publicProfile_returns200WithFullProfile() throws Exception {
        User alice = makeAlice(User.ProfileVisibility.PUBLIC);
        LearnerProfileResponse fullProfile = LearnerProfileResponse.full(alice, List.of(makePublicPok()), false, null);
        when(learnerService.getProfile(eq("alice"), any(UUID.class))).thenReturn(fullProfile);

        mockMvc.perform(get("/api/v1/learners/alice")
                .with(user(requesterId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.handle").value("alice"))
            .andExpect(jsonPath("$.displayName").value("Alice"))
            .andExpect(jsonPath("$.learnings").isArray())
            .andExpect(jsonPath("$.learningCount").doesNotExist()); // anti-vanity
    }

    @Test
    void getProfile_privateProfile_nonOwner_returns200WithPrivateShell() throws Exception {
        LearnerProfileResponse shell = LearnerProfileResponse.privateShell("alice");
        when(learnerService.getProfile(eq("alice"), any(UUID.class))).thenReturn(shell);

        mockMvc.perform(get("/api/v1/learners/alice")
                .with(user(requesterId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.handle").value("alice"))
            .andExpect(jsonPath("$.profileVisibility").value("PRIVATE"))
            .andExpect(jsonPath("$.displayName").doesNotExist())
            .andExpect(jsonPath("$.learnings").doesNotExist());
    }

    @Test
    void getProfile_owner_privateProfile_returns200WithFullProfileAndCount() throws Exception {
        User alice = makeAlice(User.ProfileVisibility.PRIVATE);
        List<Pok> poks = List.of(makePublicPok(), makePublicPok());
        LearnerProfileResponse ownerProfile = LearnerProfileResponse.full(alice, poks, true, poks.size());
        when(learnerService.getProfile(eq("alice"), any(UUID.class))).thenReturn(ownerProfile);

        mockMvc.perform(get("/api/v1/learners/alice")
                .with(user(aliceId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.learningCount").value(2)); // owner sees count (AC5b)
    }

    @Test
    void getProfile_unknownHandle_returns404() throws Exception {
        when(learnerService.getProfile(eq("ghost"), any(UUID.class)))
            .thenThrow(new LearnerNotFoundException("Learner not found: @ghost"));

        mockMvc.perform(get("/api/v1/learners/ghost")
                .with(user(requesterId.toString())))
            .andExpect(status().isNotFound());
    }

    @Test
    void getProfile_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/learners/alice"))
            .andExpect(status().isUnauthorized());
    }

    // ===== GET /api/v1/learners/{handle}/poks =====

    @Test
    void getLearnerPoks_publicProfile_returns200WithOnlyPublicPoks() throws Exception {
        Pok pub = makePublicPok();
        Page<Pok> page = new PageImpl<>(List.of(pub));
        when(learnerService.getLearnerPoks(eq("alice"), any(UUID.class), eq(0), eq(20)))
            .thenReturn(page);

        mockMvc.perform(get("/api/v1/learners/alice/poks")
                .with(user(requesterId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(1));
    }

    @Test
    void getLearnerPoks_privateProfile_nonOwner_returns403() throws Exception {
        when(learnerService.getLearnerPoks(eq("alice"), any(UUID.class), eq(0), eq(20)))
            .thenThrow(new LearnerAccessDeniedException("Profile @alice is private"));

        mockMvc.perform(get("/api/v1/learners/alice/poks")
                .with(user(requesterId.toString())))
            .andExpect(status().isForbidden());
    }

    @Test
    void getLearnerPoks_unknownHandle_returns404() throws Exception {
        when(learnerService.getLearnerPoks(eq("ghost"), any(UUID.class), eq(0), eq(20)))
            .thenThrow(new LearnerNotFoundException("Learner not found: @ghost"));

        mockMvc.perform(get("/api/v1/learners/ghost/poks")
                .with(user(requesterId.toString())))
            .andExpect(status().isNotFound());
    }
}
