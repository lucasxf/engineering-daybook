package com.lucasxf.ed.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.PokTag;
import com.lucasxf.ed.domain.PokTagSuggestion;
import com.lucasxf.ed.domain.Tag;
import com.lucasxf.ed.domain.UserTag;
import com.lucasxf.ed.dto.TagSuggestionResponse;
import com.lucasxf.ed.exception.TagNotFoundException;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokTagRepository;
import com.lucasxf.ed.repository.PokTagSuggestionRepository;
import com.lucasxf.ed.repository.TagRepository;
import com.lucasxf.ed.repository.UserTagRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TagSuggestionServiceTest {

    @Mock private PokRepository pokRepository;
    @Mock private TagRepository tagRepository;
    @Mock private UserTagRepository userTagRepository;
    @Mock private PokTagRepository pokTagRepository;
    @Mock private PokTagSuggestionRepository suggestionRepository;

    @InjectMocks
    private TagSuggestionService tagSuggestionService;

    private final UUID userId = UUID.randomUUID();
    private final UUID pokId = UUID.randomUUID();

    // ===== suggestTagsForPok =====

    @Test
    void suggestTagsForPok_withMatchingUserTag_shouldCreatePendingSuggestion() {
        // Given
        Pok pok = new Pok(userId, "Spring Boot Tutorial", "Learning Spring Boot basics and REST");
        Tag tag = new Tag("spring-boot");
        UserTag userTag = new UserTag(userId, tag, "blue");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(userId)).thenReturn(List.of(userTag));
        when(suggestionRepository.findByPokIdAndUserId(pokId, userId)).thenReturn(List.of());
        when(suggestionRepository.save(any(PokTagSuggestion.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        tagSuggestionService.suggestTagsForPok(pokId, userId);

        // Then — suggestion created for "spring-boot" (matches title)
        ArgumentCaptor<PokTagSuggestion> captor = ArgumentCaptor.forClass(PokTagSuggestion.class);
        verify(suggestionRepository).save(captor.capture());
        assertThat(captor.getValue().getSuggestedName()).isEqualTo("spring-boot");
        assertThat(captor.getValue().getStatus()).isEqualTo(PokTagSuggestion.Status.PENDING);
    }

    @Test
    void suggestTagsForPok_withAlreadyAssignedTag_shouldSkipSuggestion() {
        // Given — tag already assigned to this POK
        Pok pok = new Pok(userId, "Spring Boot Tutorial", "Learning Spring Boot");
        Tag tag = new Tag("spring-boot");
        UserTag userTag = new UserTag(userId, tag, "blue");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(userId)).thenReturn(List.of(userTag));
        when(pokTagRepository.findByPokIdAndTagId(eq(pokId), any()))
                .thenReturn(Optional.of(new PokTag(pokId, tag.getId(), PokTag.Source.MANUAL)));

        // When
        tagSuggestionService.suggestTagsForPok(pokId, userId);

        // Then — no suggestion created (tag already assigned)
        verify(suggestionRepository, never()).save(any());
    }

    @Test
    void suggestTagsForPok_withExistingPendingSuggestion_shouldNotDuplicate() {
        // Given — suggestion already pending
        Pok pok = new Pok(userId, "Spring Boot Tutorial", "Learning Spring Boot");
        Tag tag = new Tag("spring-boot");
        UserTag userTag = new UserTag(userId, tag, "blue");
        PokTagSuggestion existing = new PokTagSuggestion(pokId, userId, "spring-boot");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(userId)).thenReturn(List.of(userTag));
        when(pokTagRepository.findByPokIdAndTagId(any(), any())).thenReturn(Optional.empty());
        when(suggestionRepository.findByPokIdAndUserId(pokId, userId)).thenReturn(List.of(existing));

        // When
        tagSuggestionService.suggestTagsForPok(pokId, userId);

        // Then — no duplicate suggestion created
        verify(suggestionRepository, never()).save(any());
    }

    @Test
    void suggestTagsForPok_withNonMatchingUserTags_shouldCreateNoSuggestions() {
        // Given — user has "docker" tag but POK is about Java
        Pok pok = new Pok(userId, "Java Streams", "Learning about functional streams in Java");
        Tag tag = new Tag("docker");
        UserTag userTag = new UserTag(userId, tag, "blue");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(userId)).thenReturn(List.of(userTag));
        when(pokTagRepository.findByPokIdAndTagId(any(), any())).thenReturn(Optional.empty());
        when(suggestionRepository.findByPokIdAndUserId(pokId, userId)).thenReturn(List.of());

        // When
        tagSuggestionService.suggestTagsForPok(pokId, userId);

        // Then — no suggestion
        verify(suggestionRepository, never()).save(any());
    }

    @Test
    void suggestTagsForPok_withNonExistentPok_shouldDoNothing() {
        // Given
        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.empty());

        // When — no exception, silent fail
        tagSuggestionService.suggestTagsForPok(pokId, userId);

        // Then
        verify(suggestionRepository, never()).save(any());
    }

    // ===== getPendingSuggestions =====

    @Test
    void getPendingSuggestions_shouldReturnOnlyPendingForPok() {
        // Given
        PokTagSuggestion pending = new PokTagSuggestion(pokId, userId, "kubernetes");

        when(suggestionRepository.findByPokIdAndUserIdAndStatus(pokId, userId, PokTagSuggestion.Status.PENDING))
                .thenReturn(List.of(pending));

        // When
        List<TagSuggestionResponse> result = tagSuggestionService.getPendingSuggestions(pokId, userId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).suggestedName()).isEqualTo("kubernetes");
        assertThat(result.get(0).status()).isEqualTo("PENDING");
    }

    // ===== approveSuggestion =====

    @Test
    void approveSuggestion_shouldCreatePokTagWithAiSourceAndMarkApproved() {
        // Given
        UUID suggestionId = UUID.randomUUID();
        Tag tag = new Tag("kubernetes");
        PokTagSuggestion suggestion = new PokTagSuggestion(pokId, userId, "kubernetes");

        when(suggestionRepository.findByIdAndUserIdAndStatus(suggestionId, userId, PokTagSuggestion.Status.PENDING))
                .thenReturn(Optional.of(suggestion));
        when(tagRepository.findByNameIgnoreCase("kubernetes")).thenReturn(Optional.of(tag));
        when(pokTagRepository.findByPokIdAndTagId(any(), any())).thenReturn(Optional.empty());
        when(pokTagRepository.save(any(PokTag.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        tagSuggestionService.approveSuggestion(suggestionId, userId);

        // Then
        assertThat(suggestion.getStatus()).isEqualTo(PokTagSuggestion.Status.APPROVED);
        ArgumentCaptor<PokTag> captor = ArgumentCaptor.forClass(PokTag.class);
        verify(pokTagRepository).save(captor.capture());
        assertThat(captor.getValue().getSource()).isEqualTo(PokTag.Source.AI);
    }

    @Test
    void approveSuggestion_withAlreadyAssignedTag_shouldMarkApprovedWithAiEditedSource() {
        // Given — tag already manually assigned; approve upgrades source to AI_EDITED
        UUID suggestionId = UUID.randomUUID();
        Tag tag = new Tag("kubernetes");
        PokTagSuggestion suggestion = new PokTagSuggestion(pokId, userId, "kubernetes");
        PokTag existing = new PokTag(pokId, tag.getId(), PokTag.Source.MANUAL);

        when(suggestionRepository.findByIdAndUserIdAndStatus(suggestionId, userId, PokTagSuggestion.Status.PENDING))
                .thenReturn(Optional.of(suggestion));
        when(tagRepository.findByNameIgnoreCase("kubernetes")).thenReturn(Optional.of(tag));
        when(pokTagRepository.findByPokIdAndTagId(any(), any())).thenReturn(Optional.of(existing));

        // When
        tagSuggestionService.approveSuggestion(suggestionId, userId);

        // Then — source updated to AI_EDITED, no new record
        assertThat(suggestion.getStatus()).isEqualTo(PokTagSuggestion.Status.APPROVED);
        assertThat(existing.getSource()).isEqualTo(PokTag.Source.AI_EDITED);
        verify(pokTagRepository, never()).save(any(PokTag.class));
    }

    @Test
    void approveSuggestion_withNonExistentSuggestion_shouldThrowTagNotFoundException() {
        // Given
        UUID suggestionId = UUID.randomUUID();
        when(suggestionRepository.findByIdAndUserIdAndStatus(suggestionId, userId, PokTagSuggestion.Status.PENDING)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> tagSuggestionService.approveSuggestion(suggestionId, userId))
                .isInstanceOf(TagNotFoundException.class);
    }

    // ===== rejectSuggestion =====

    @Test
    void rejectSuggestion_shouldMarkSuggestionRejected() {
        // Given
        UUID suggestionId = UUID.randomUUID();
        PokTagSuggestion suggestion = new PokTagSuggestion(pokId, userId, "kubernetes");

        when(suggestionRepository.findByIdAndUserIdAndStatus(suggestionId, userId, PokTagSuggestion.Status.PENDING))
                .thenReturn(Optional.of(suggestion));

        // When
        tagSuggestionService.rejectSuggestion(suggestionId, userId);

        // Then
        assertThat(suggestion.getStatus()).isEqualTo(PokTagSuggestion.Status.REJECTED);
        verify(suggestionRepository).save(suggestion);
    }

    @Test
    void rejectSuggestion_withNonExistentSuggestion_shouldThrowTagNotFoundException() {
        // Given
        UUID suggestionId = UUID.randomUUID();
        when(suggestionRepository.findByIdAndUserIdAndStatus(suggestionId, userId, PokTagSuggestion.Status.PENDING)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> tagSuggestionService.rejectSuggestion(suggestionId, userId))
                .isInstanceOf(TagNotFoundException.class);
    }
}
