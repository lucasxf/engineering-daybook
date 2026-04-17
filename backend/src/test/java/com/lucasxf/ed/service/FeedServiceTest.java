package com.lucasxf.ed.service;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;

import com.lucasxf.ed.dto.FeedItemResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link FeedService}.
 *
 * <p>These tests verify pagination logic, empty-feed short-circuit, and parameter
 * binding. SQL correctness (visibility rules, ordering) is covered by
 * {@code FeedIntegrationTest}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-08
 */
@ExtendWith(MockitoExtension.class)
class FeedServiceTest {

    @Mock
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @InjectMocks
    private FeedService feedService;

    private UUID requesterId;

    @BeforeEach
    void setUp() {
        requesterId = UUID.randomUUID();
    }

    // ===== EMPTY FEED TESTS =====

    @Test
    @SuppressWarnings("unchecked")
    void getDiscoveryFeed_whenCountIsZero_returnsEmptyPageWithoutQueryingItems() {
        // Given: no content in the feed
        when(namedParameterJdbcTemplate.queryForObject(anyString(), any(SqlParameterSource.class), eq(Long.class)))
            .thenReturn(0L);

        // When
        Page<FeedItemResponse> result = feedService.getDiscoveryFeed(requesterId, 0, 20);

        // Then: empty page, no item query executed
        assertThat(result.isEmpty()).isTrue();
        assertThat(result.getTotalElements()).isZero();
        assertThat(result.getTotalPages()).isZero();
        verify(namedParameterJdbcTemplate, never())
            .query(anyString(), any(SqlParameterSource.class), any(RowMapper.class));
    }

    @Test
    @SuppressWarnings("unchecked")
    void getDiscoveryFeed_whenCountIsNull_treatsAsZero() {
        // Given: count query returns null (defensive guard)
        when(namedParameterJdbcTemplate.queryForObject(anyString(), any(SqlParameterSource.class), eq(Long.class)))
            .thenReturn(null);

        // When
        Page<FeedItemResponse> result = feedService.getDiscoveryFeed(requesterId, 0, 20);

        // Then: treated as empty
        assertThat(result.isEmpty()).isTrue();
        verify(namedParameterJdbcTemplate, never())
            .query(anyString(), any(SqlParameterSource.class), any(RowMapper.class));
    }

    // ===== PAGINATION TESTS =====

    @Test
    @SuppressWarnings("unchecked")
    void getDiscoveryFeed_withPageZeroSize20_usesOffsetZero() {
        // Given
        when(namedParameterJdbcTemplate.queryForObject(anyString(), any(SqlParameterSource.class), eq(Long.class)))
            .thenReturn(5L);
        when(namedParameterJdbcTemplate.query(anyString(), any(SqlParameterSource.class), any(RowMapper.class)))
            .thenReturn(List.of());

        ArgumentCaptor<SqlParameterSource> paramsCaptor = ArgumentCaptor.forClass(SqlParameterSource.class);

        // When
        feedService.getDiscoveryFeed(requesterId, 0, 20);

        // Then: LIMIT and OFFSET params passed
        verify(namedParameterJdbcTemplate)
            .query(anyString(), paramsCaptor.capture(), any(RowMapper.class));

        SqlParameterSource params = paramsCaptor.getValue();
        assertThat(params.getValue("size")).isEqualTo(20);
        assertThat(params.getValue("offset")).isEqualTo(0L);
        assertThat(params.getValue("selfLimit")).isEqualTo(FeedService.SELF_POK_LIMIT);
    }

    @Test
    @SuppressWarnings("unchecked")
    void getDiscoveryFeed_withPageTwoSize10_usesOffset20() {
        // Given
        when(namedParameterJdbcTemplate.queryForObject(anyString(), any(SqlParameterSource.class), eq(Long.class)))
            .thenReturn(30L);
        when(namedParameterJdbcTemplate.query(anyString(), any(SqlParameterSource.class), any(RowMapper.class)))
            .thenReturn(List.of());

        ArgumentCaptor<SqlParameterSource> paramsCaptor = ArgumentCaptor.forClass(SqlParameterSource.class);

        // When
        feedService.getDiscoveryFeed(requesterId, 2, 10);

        // Then: offset = page * size = 2 * 10 = 20
        verify(namedParameterJdbcTemplate)
            .query(anyString(), paramsCaptor.capture(), any(RowMapper.class));

        SqlParameterSource params = paramsCaptor.getValue();
        assertThat(params.getValue("size")).isEqualTo(10);
        assertThat(params.getValue("offset")).isEqualTo(20L);
    }

    // ===== RESULT ASSEMBLY TESTS =====

    @Test
    @SuppressWarnings("unchecked")
    void getDiscoveryFeed_withItems_returnsCorrectPageMetadata() {
        // Given: 45 total items, fetching page 0 with size 20 returns first 20
        long total = 45L;
        List<FeedItemResponse> pageItems = java.util.stream.IntStream.range(0, 20)
            .mapToObj(i -> (FeedItemResponse) mockPokResponse(UUID.randomUUID()))
            .toList();

        when(namedParameterJdbcTemplate.queryForObject(anyString(), any(SqlParameterSource.class), eq(Long.class)))
            .thenReturn(total);
        when(namedParameterJdbcTemplate.query(anyString(), any(SqlParameterSource.class), any(RowMapper.class)))
            .thenReturn(pageItems);

        // When
        Page<FeedItemResponse> result = feedService.getDiscoveryFeed(requesterId, 0, 20);

        // Then
        assertThat(result.getContent()).hasSize(20);
        assertThat(result.getTotalElements()).isEqualTo(45);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getNumber()).isZero();
    }

    @Test
    @SuppressWarnings("unchecked")
    void getDiscoveryFeed_lastPage_returnsCorrectPageMetadata() {
        // Given: 45 total items, requesting page 2 (last page, 5 items)
        List<FeedItemResponse> lastPageItems = java.util.stream.IntStream.range(0, 5)
            .mapToObj(i -> (FeedItemResponse) mockPokResponse(UUID.randomUUID()))
            .toList();

        when(namedParameterJdbcTemplate.queryForObject(anyString(), any(SqlParameterSource.class), eq(Long.class)))
            .thenReturn(45L);
        when(namedParameterJdbcTemplate.query(anyString(), any(SqlParameterSource.class), any(RowMapper.class)))
            .thenReturn(lastPageItems);

        // When
        Page<FeedItemResponse> result = feedService.getDiscoveryFeed(requesterId, 2, 20);

        // Then
        assertThat(result.getContent()).hasSize(5);
        assertThat(result.getTotalElements()).isEqualTo(45);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getNumber()).isEqualTo(2);
    }

    // ===== REQUESTER ID BINDING TESTS =====

    @Test
    @SuppressWarnings("unchecked")
    void getDiscoveryFeed_bindsRequesterIdInBothQueries() {
        // Given
        when(namedParameterJdbcTemplate.queryForObject(anyString(), any(SqlParameterSource.class), eq(Long.class)))
            .thenReturn(1L);
        when(namedParameterJdbcTemplate.query(anyString(), any(SqlParameterSource.class), any(RowMapper.class)))
            .thenReturn(List.of());

        ArgumentCaptor<SqlParameterSource> countParamsCaptor = ArgumentCaptor.forClass(SqlParameterSource.class);
        ArgumentCaptor<SqlParameterSource> itemParamsCaptor = ArgumentCaptor.forClass(SqlParameterSource.class);

        // When
        feedService.getDiscoveryFeed(requesterId, 0, 20);

        // Then: requesterId bound in both count and item queries
        verify(namedParameterJdbcTemplate)
            .queryForObject(anyString(), countParamsCaptor.capture(), eq(Long.class));
        verify(namedParameterJdbcTemplate)
            .query(anyString(), itemParamsCaptor.capture(), any(RowMapper.class));

        assertThat(countParamsCaptor.getValue().getValue("requesterId")).isEqualTo(requesterId);
        assertThat(countParamsCaptor.getValue().getValue("selfLimit")).isEqualTo(FeedService.SELF_POK_LIMIT);
        assertThat(itemParamsCaptor.getValue().getValue("requesterId")).isEqualTo(requesterId);
        assertThat(itemParamsCaptor.getValue().getValue("selfLimit")).isEqualTo(FeedService.SELF_POK_LIMIT);
    }

    // ===== HELPER =====

    private com.lucasxf.ed.dto.PokResponse mockPokResponse(UUID id) {
        return com.lucasxf.ed.dto.PokResponse.fromFeed(
            id, UUID.randomUUID(), "Title", "Content",
            com.lucasxf.ed.domain.Pok.Visibility.PUBLIC,
            java.time.Instant.now(), java.time.Instant.now(),
            "author", "Author Name", null);
    }
}
