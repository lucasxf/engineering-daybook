package com.lucasxf.ed.service;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.UserTagRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link TagSuggestionBackfillService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-28
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TagSuggestionBackfillService")
class TagSuggestionBackfillServiceTest {

    @Mock private UserTagRepository userTagRepository;
    @Mock private PokRepository pokRepository;
    @Mock private TagSuggestionService tagSuggestionService;

    private TagSuggestionBackfillService service;

    @BeforeEach
    void setUp() {
        service = new TagSuggestionBackfillService(userTagRepository, pokRepository, tagSuggestionService);
    }

    @Test
    @DisplayName("returns 0 when no users have active tags")
    void backfill_whenNoUsersHaveTags_returnsZero() {
        when(userTagRepository.findDistinctUserIdsWithActiveTags()).thenReturn(List.of());

        int result = service.backfill();

        assertThat(result).isEqualTo(0);
        verify(tagSuggestionService, never()).suggestTagsForPok(any(), any());
    }

    @Test
    @DisplayName("enqueues all POKs for users with active tags and returns total count")
    void backfill_enqueuesAllPoksForUsersWithTags() {
        UUID userId1 = UUID.randomUUID();
        UUID userId2 = UUID.randomUUID();
        UUID pokId1 = UUID.randomUUID();
        UUID pokId2 = UUID.randomUUID();
        UUID pokId3 = UUID.randomUUID();

        when(userTagRepository.findDistinctUserIdsWithActiveTags())
            .thenReturn(List.of(userId1, userId2));
        when(pokRepository.findIdsByUserId(userId1)).thenReturn(List.of(pokId1, pokId2));
        when(pokRepository.findIdsByUserId(userId2)).thenReturn(List.of(pokId3));

        int result = service.backfill();

        assertThat(result).isEqualTo(3);
        verify(tagSuggestionService).suggestTagsForPok(pokId1, userId1);
        verify(tagSuggestionService).suggestTagsForPok(pokId2, userId1);
        verify(tagSuggestionService).suggestTagsForPok(pokId3, userId2);
    }

    @Test
    @DisplayName("skips users with no POKs without error")
    void backfill_skipsUsersWithNoPoks() {
        UUID userId = UUID.randomUUID();
        when(userTagRepository.findDistinctUserIdsWithActiveTags()).thenReturn(List.of(userId));
        when(pokRepository.findIdsByUserId(userId)).thenReturn(List.of());

        int result = service.backfill();

        assertThat(result).isEqualTo(0);
        verify(tagSuggestionService, never()).suggestTagsForPok(any(), any());
    }

    @Test
    @DisplayName("is idempotent: suggestTagsForPok handles duplicate suggestion skipping internally")
    void backfill_isIdempotent_canBeCalledMultipleTimes() {
        UUID userId = UUID.randomUUID();
        UUID pokId = UUID.randomUUID();

        when(userTagRepository.findDistinctUserIdsWithActiveTags()).thenReturn(List.of(userId));
        when(pokRepository.findIdsByUserId(userId)).thenReturn(List.of(pokId));

        int first = service.backfill();
        int second = service.backfill();

        assertThat(first).isEqualTo(1);
        assertThat(second).isEqualTo(1);
    }
}
