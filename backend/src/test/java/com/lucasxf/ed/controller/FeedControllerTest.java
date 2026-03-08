package com.lucasxf.ed.controller;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.dto.FeedItemResponse;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.FeedService;
import com.lucasxf.ed.service.JwtService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Controller slice tests for {@link FeedController}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-08
 */
@WebMvcTest(FeedController.class)
@Import(SecurityConfig.class)
@EnableConfigurationProperties(CorsProperties.class)
class FeedControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FeedService feedService;

    @MockitoBean
    private JwtService jwtService;

    private final UUID userId = UUID.randomUUID();

    // ===== AUTH GUARD =====

    @Test
    void getFeed_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/feed"))
            .andExpect(status().isUnauthorized());
    }

    // ===== SUCCESS CASES =====

    @Test
    void getFeed_withDefaultParams_delegatesToServicePage0Size20() throws Exception {
        when(feedService.getDiscoveryFeed(any(UUID.class), anyInt(), anyInt()))
            .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        mockMvc.perform(get("/api/v1/feed")
                .with(user(userId.toString())))
            .andExpect(status().isOk());

        verify(feedService).getDiscoveryFeed(eq(userId), eq(0), eq(20));
    }

    @Test
    void getFeed_withExplicitPageAndSize_delegatesCorrectly() throws Exception {
        when(feedService.getDiscoveryFeed(any(UUID.class), anyInt(), anyInt()))
            .thenReturn(new PageImpl<>(List.of(), PageRequest.of(1, 10), 0));

        mockMvc.perform(get("/api/v1/feed?page=1&size=10")
                .with(user(userId.toString())))
            .andExpect(status().isOk());

        verify(feedService).getDiscoveryFeed(eq(userId), eq(1), eq(10));
    }

    @Test
    void getFeed_withItems_returnsPageJson() throws Exception {
        UUID pokId = UUID.randomUUID();
        PokResponse owned = PokResponse.fromFeed(
            pokId, UUID.randomUUID(), "My Learning", "Content here",
            Pok.Visibility.PUBLIC, Instant.now(), Instant.now(),
            "bob", "Bob Smith", null);

        List<FeedItemResponse> items = List.of(owned);
        when(feedService.getDiscoveryFeed(any(UUID.class), anyInt(), anyInt()))
            .thenReturn(new PageImpl<>(items, PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/feed")
                .with(user(userId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].type").value("owned"))
            .andExpect(jsonPath("$.content[0].id").value(pokId.toString()))
            .andExpect(jsonPath("$.content[0].authorHandle").value("bob"))
            .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getFeed_withEmptyFeed_returnsEmptyPage() throws Exception {
        when(feedService.getDiscoveryFeed(any(UUID.class), anyInt(), anyInt()))
            .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        mockMvc.perform(get("/api/v1/feed")
                .with(user(userId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isEmpty())
            .andExpect(jsonPath("$.totalElements").value(0));
    }
}
