package com.lucasxf.ed.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.dto.FeedItemResponse;
import com.lucasxf.ed.dto.LearnerProfileResponse;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.exception.AlreadyFollowingException;
import com.lucasxf.ed.exception.LearnerAccessDeniedException;
import com.lucasxf.ed.exception.LearnerNotFoundException;
import com.lucasxf.ed.exception.NotFollowingException;
import com.lucasxf.ed.exception.SelfFollowException;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.FollowService;
import com.lucasxf.ed.service.JwtService;
import com.lucasxf.ed.service.LearnerService;
import com.lucasxf.ed.service.UserService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.http.MediaType;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
    private FollowService followService;

    @MockitoBean
    private UserService userService;

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
        LearnerProfileResponse fullProfile = LearnerProfileResponse.full(
            alice, List.of(makePublicPok()), false, null, null, null, null, null);
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
        LearnerProfileResponse ownerProfile = LearnerProfileResponse.full(
            alice, poks, true, poks.size(), null, 5L, 3L, 2L);
        when(learnerService.getProfile(eq("alice"), any(UUID.class))).thenReturn(ownerProfile);

        mockMvc.perform(get("/api/v1/learners/alice")
                .with(user(aliceId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.learningCount").value(2))
            .andExpect(jsonPath("$.followerCount").value(5))
            .andExpect(jsonPath("$.followingCount").value(3))
            .andExpect(jsonPath("$.colleagueCount").value(2));
    }

    @Test
    void getProfile_publicProfile_showsAvatarUrlAndBio() throws Exception {
        User alice = makeAlice(User.ProfileVisibility.PUBLIC);
        alice.setAvatarUrl("https://storage.example.com/avatars/alice.jpg");
        alice.setBio("I love learning!");
        LearnerProfileResponse profile = LearnerProfileResponse.full(
            alice, List.of(), false, null, null, null, null, null);
        when(learnerService.getProfile(eq("alice"), any(UUID.class))).thenReturn(profile);

        mockMvc.perform(get("/api/v1/learners/alice")
                .with(user(requesterId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.avatarUrl").value("https://storage.example.com/avatars/alice.jpg"))
            .andExpect(jsonPath("$.bio").value("I love learning!"));
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
        PokResponse pubResponse = PokResponse.from(makePublicPok());
        Page<FeedItemResponse> page = new PageImpl<>(List.of(pubResponse));
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

    // ===== POST /api/v1/learners/{handle}/follow =====

    @Test
    void follow_success_returns204() throws Exception {
        when(userService.findByHandle("alice")).thenReturn(Optional.of(makeAlice(User.ProfileVisibility.PUBLIC)));
        doNothing().when(followService).follow(any(UUID.class), eq(aliceId));

        mockMvc.perform(post("/api/v1/learners/alice/follow")
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(requesterId.toString())))
            .andExpect(status().isNoContent());
    }

    @Test
    void follow_selfFollow_returns400() throws Exception {
        when(userService.findByHandle("alice")).thenReturn(Optional.of(makeAlice(User.ProfileVisibility.PUBLIC)));
        doThrow(new SelfFollowException("You cannot follow yourself"))
            .when(followService).follow(any(UUID.class), eq(aliceId));

        mockMvc.perform(post("/api/v1/learners/alice/follow")
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(requesterId.toString())))
            .andExpect(status().isBadRequest());
    }

    @Test
    void follow_alreadyFollowing_returns409() throws Exception {
        when(userService.findByHandle("alice")).thenReturn(Optional.of(makeAlice(User.ProfileVisibility.PUBLIC)));
        doThrow(new AlreadyFollowingException("Already following"))
            .when(followService).follow(any(UUID.class), eq(aliceId));

        mockMvc.perform(post("/api/v1/learners/alice/follow")
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(requesterId.toString())))
            .andExpect(status().isConflict());
    }

    @Test
    void follow_unknownHandle_returns404() throws Exception {
        when(userService.findByHandle("ghost")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/v1/learners/ghost/follow")
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(requesterId.toString())))
            .andExpect(status().isNotFound());
    }

    // ===== DELETE /api/v1/learners/{handle}/follow =====

    @Test
    void unfollow_success_returns204() throws Exception {
        when(userService.findByHandle("alice")).thenReturn(Optional.of(makeAlice(User.ProfileVisibility.PUBLIC)));
        doNothing().when(followService).unfollow(any(UUID.class), eq(aliceId));

        mockMvc.perform(delete("/api/v1/learners/alice/follow")
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(requesterId.toString())))
            .andExpect(status().isNoContent());
    }

    @Test
    void unfollow_notFollowing_returns409() throws Exception {
        when(userService.findByHandle("alice")).thenReturn(Optional.of(makeAlice(User.ProfileVisibility.PUBLIC)));
        doThrow(new NotFollowingException("Not following"))
            .when(followService).unfollow(any(UUID.class), eq(aliceId));

        mockMvc.perform(delete("/api/v1/learners/alice/follow")
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(requesterId.toString())))
            .andExpect(status().isConflict());
    }
}
