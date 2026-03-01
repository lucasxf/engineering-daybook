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

import org.springframework.test.util.ReflectionTestUtils;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.PokTag;
import com.lucasxf.ed.domain.Tag;
import com.lucasxf.ed.domain.UserTag;
import com.lucasxf.ed.dto.CreateTagRequest;
import com.lucasxf.ed.dto.TagResponse;
import com.lucasxf.ed.dto.UpdateTagRequest;
import com.lucasxf.ed.exception.TagConflictException;
import com.lucasxf.ed.exception.TagNotFoundException;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokTagRepository;
import com.lucasxf.ed.repository.TagRepository;
import com.lucasxf.ed.repository.UserTagRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @Mock
    private UserTagRepository userTagRepository;

    @Mock
    private PokTagRepository pokTagRepository;

    @Mock
    private PokRepository pokRepository;

    @InjectMocks
    private TagService tagService;

    private final UUID userId = UUID.randomUUID();
    private final UUID tagId = UUID.randomUUID();

    // ===== createOrReuse =====

    @Test
    void createOrReuse_withNewName_shouldCreateGlobalTagAndSubscription() {
        // Given
        CreateTagRequest request = new CreateTagRequest("spring-boot");
        Tag savedTag = new Tag("spring-boot");
        UserTag savedUserTag = new UserTag(userId, savedTag, "blue");

        when(userTagRepository.existsByUserIdAndTagNameIgnoreCaseAndDeletedAtIsNull(userId, "spring-boot"))
                .thenReturn(false);
        when(tagRepository.findByNameIgnoreCase("spring-boot")).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenReturn(savedTag);
        when(userTagRepository.save(any(UserTag.class))).thenReturn(savedUserTag);

        // When
        TagResponse response = tagService.createOrReuse(request, userId);

        // Then
        assertThat(response.name()).isEqualTo("spring-boot");
        verify(tagRepository).save(any(Tag.class));
        verify(userTagRepository).save(any(UserTag.class));
    }

    @Test
    void createOrReuse_withExistingGlobalTag_shouldReusedGlobalAndCreateSubscription() {
        // Given
        CreateTagRequest request = new CreateTagRequest("Spring-Boot"); // different casing
        Tag existingGlobal = new Tag("spring-boot");
        UserTag savedUserTag = new UserTag(userId, existingGlobal, "red");

        when(userTagRepository.existsByUserIdAndTagNameIgnoreCaseAndDeletedAtIsNull(userId, "Spring-Boot"))
                .thenReturn(false);
        when(tagRepository.findByNameIgnoreCase("Spring-Boot")).thenReturn(Optional.of(existingGlobal));
        when(userTagRepository.save(any(UserTag.class))).thenReturn(savedUserTag);

        // When
        TagResponse response = tagService.createOrReuse(request, userId);

        // Then
        assertThat(response.name()).isEqualTo("spring-boot");
        verify(tagRepository, never()).save(any()); // global already exists
        verify(userTagRepository).save(any(UserTag.class));
    }

    @Test
    void createOrReuse_withDuplicateInUserActiveSet_shouldReturnExistingIdempotently() {
        // Given
        CreateTagRequest request = new CreateTagRequest("docker");
        Tag globalTag = new Tag("docker");
        UserTag existingUserTag = new UserTag(userId, globalTag, "green");

        when(userTagRepository.existsByUserIdAndTagNameIgnoreCaseAndDeletedAtIsNull(userId, "docker"))
                .thenReturn(true);
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(userId))
                .thenReturn(List.of(existingUserTag));

        // When
        TagResponse response = tagService.createOrReuse(request, userId);

        // Then — no new records created, existing tag returned
        assertThat(response.name()).isEqualTo("docker");
        verify(tagRepository, never()).save(any());
        verify(userTagRepository, never()).save(any());
    }

    @Test
    void createOrReuse_shouldTrimWhitespace() {
        // Given
        CreateTagRequest request = new CreateTagRequest("  spring boot  ");
        Tag savedTag = new Tag("spring boot");
        UserTag savedUserTag = new UserTag(userId, savedTag, "yellow");

        when(userTagRepository.existsByUserIdAndTagNameIgnoreCaseAndDeletedAtIsNull(userId, "spring boot"))
                .thenReturn(false);
        when(tagRepository.findByNameIgnoreCase("spring boot")).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenReturn(savedTag);
        when(userTagRepository.save(any(UserTag.class))).thenReturn(savedUserTag);

        // When
        tagService.createOrReuse(request, userId);

        // Then — saved tag has trimmed name
        ArgumentCaptor<Tag> tagCaptor = ArgumentCaptor.forClass(Tag.class);
        verify(tagRepository).save(tagCaptor.capture());
        assertThat(tagCaptor.getValue().getName()).isEqualTo("spring boot");
    }

    // ===== getUserTags =====

    @Test
    void getUserTags_shouldReturnOnlyActiveSubscriptions() {
        // Given
        Tag tag = new Tag("java");
        UserTag activeTag = new UserTag(userId, tag, "blue");
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(userId)).thenReturn(List.of(activeTag));

        // When
        List<TagResponse> result = tagService.getUserTags(userId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("java");
    }

    @Test
    void getUserTags_withNoTags_shouldReturnEmptyList() {
        // Given
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(userId)).thenReturn(List.of());

        // When
        List<TagResponse> result = tagService.getUserTags(userId);

        // Then
        assertThat(result).isEmpty();
    }

    // ===== renameTag =====

    @Test
    void renameTag_shouldSoftDeleteOldAndCreateNewSubscription() {
        // Given
        Tag oldGlobalTag = new Tag("k8s");
        UserTag oldUserTag = new UserTag(userId, oldGlobalTag, "purple");
        Tag newGlobalTag = new Tag("kubernetes");
        UserTag newUserTag = new UserTag(userId, newGlobalTag, "purple");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(oldUserTag));
        when(userTagRepository.existsByUserIdAndTagNameIgnoreCaseAndDeletedAtIsNull(userId, "kubernetes"))
                .thenReturn(false);
        when(tagRepository.findByNameIgnoreCase("kubernetes")).thenReturn(Optional.of(newGlobalTag));
        when(userTagRepository.save(any(UserTag.class))).thenReturn(newUserTag);
        when(pokRepository.findIdsByUserId(userId)).thenReturn(List.of());

        // When
        TagResponse response = tagService.renameTag(oldUserTag.getId(), new UpdateTagRequest("kubernetes"), userId);

        // Then
        assertThat(response.name()).isEqualTo("kubernetes");
        assertThat(oldUserTag.isActive()).isFalse(); // soft-deleted
    }

    @Test
    void renameTag_withConflictingName_shouldThrowTagConflictException() {
        // Given
        Tag tag = new Tag("k8s");
        UserTag userTag = new UserTag(userId, tag, "blue");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(userTag));
        when(userTagRepository.existsByUserIdAndTagNameIgnoreCaseAndDeletedAtIsNull(userId, "kubernetes"))
                .thenReturn(true);

        // When/Then
        assertThatThrownBy(() ->
                tagService.renameTag(userTag.getId(), new UpdateTagRequest("kubernetes"), userId))
                .isInstanceOf(TagConflictException.class);
    }

    @Test
    void renameTag_withNonExistentTag_shouldThrowTagNotFoundException() {
        // Given
        when(userTagRepository.findById(any())).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() ->
                tagService.renameTag(UUID.randomUUID(), new UpdateTagRequest("new-name"), userId))
                .isInstanceOf(TagNotFoundException.class);
    }

    @Test
    void renameTag_withTagOwnedByAnotherUser_shouldThrowTagNotFoundException() {
        // Given
        UUID anotherUserId = UUID.randomUUID();
        Tag tag = new Tag("java");
        UserTag anotherUsersTag = new UserTag(anotherUserId, tag, "blue");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(anotherUsersTag));

        // When/Then
        assertThatThrownBy(() ->
                tagService.renameTag(anotherUsersTag.getId(), new UpdateTagRequest("java2"), userId))
                .isInstanceOf(TagNotFoundException.class); // 403 masked as 404
    }

    // ===== deleteTag =====

    @Test
    void deleteTag_shouldSoftDeleteSubscriptionAndRemovePokTagAssignments() {
        // Given
        Tag tag = new Tag("legacy");
        UserTag userTag = new UserTag(userId, tag, "red");
        List<UUID> userPokIds = List.of(UUID.randomUUID(), UUID.randomUUID());

        when(userTagRepository.findById(any())).thenReturn(Optional.of(userTag));
        when(pokRepository.findIdsByUserId(userId)).thenReturn(userPokIds);

        // When
        tagService.deleteTag(userTag.getId(), userId);

        // Then
        assertThat(userTag.isActive()).isFalse(); // soft-deleted
        verify(pokTagRepository).deleteByTagIdAndPokIdIn(any(), any());
        verify(userTagRepository).save(userTag);
    }

    @Test
    void deleteTag_withTagOwnedByAnotherUser_shouldThrowTagNotFoundException() {
        // Given
        UUID anotherUserId = UUID.randomUUID();
        Tag tag = new Tag("shared");
        UserTag anotherUsersTag = new UserTag(anotherUserId, tag, "green");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(anotherUsersTag));

        // When/Then
        assertThatThrownBy(() -> tagService.deleteTag(anotherUsersTag.getId(), userId))
                .isInstanceOf(TagNotFoundException.class);
    }

    // ===== assignTag =====

    @Test
    void assignTag_shouldCreatePokTagWithManualSource() {
        // Given
        UUID pokId = UUID.randomUUID();
        Tag tag = new Tag("java");
        UserTag userTag = new UserTag(userId, tag, "blue");
        Pok pok = new Pok(userId, "title", "content");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(userTag));
        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(pokTagRepository.findByPokIdAndTagId(eq(pokId), any())).thenReturn(Optional.empty());
        when(pokTagRepository.save(any(PokTag.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        tagService.assignTag(pokId, userTag.getId(), userId);

        // Then
        ArgumentCaptor<PokTag> captor = ArgumentCaptor.forClass(PokTag.class);
        verify(pokTagRepository).save(captor.capture());
        assertThat(captor.getValue().getSource()).isEqualTo(PokTag.Source.MANUAL);
    }

    @Test
    void assignTag_withAlreadyAssignedTag_shouldBeIdempotent() {
        // Given
        UUID pokId = UUID.randomUUID();
        Tag tag = new Tag("java");
        UserTag userTag = new UserTag(userId, tag, "blue");
        PokTag existing = new PokTag(pokId, tag.getId(), PokTag.Source.MANUAL);
        Pok pok = new Pok(userId, "title", "content");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(userTag));
        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(pokTagRepository.findByPokIdAndTagId(any(), any())).thenReturn(Optional.of(existing));

        // When — no exception, no duplicate
        tagService.assignTag(pokId, userTag.getId(), userId);

        // Then
        verify(pokTagRepository, never()).save(any());
    }

    // ===== removeTag =====

    @Test
    void removeTag_shouldDeletePokTagAssignment() {
        // Given
        UUID pokId = UUID.randomUUID();
        Tag tag = new Tag("java");
        UserTag userTag = new UserTag(userId, tag, "blue");
        PokTag pokTag = new PokTag(pokId, tag.getId(), PokTag.Source.MANUAL);
        Pok pok = new Pok(userId, "title", "content");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(userTag));
        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(pokTagRepository.findByPokIdAndTagId(any(), any())).thenReturn(Optional.of(pokTag));

        // When
        tagService.removeTag(pokId, userTag.getId(), userId);

        // Then — assignment removed, subscription intact
        verify(pokTagRepository).delete(pokTag);
    }

    @Test
    void removeTag_withNonExistentAssignment_shouldDoNothingGracefully() {
        // Given
        UUID pokId = UUID.randomUUID();
        Tag tag = new Tag("java");
        UserTag userTag = new UserTag(userId, tag, "blue");
        Pok pok = new Pok(userId, "title", "content");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(userTag));
        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(pokTagRepository.findByPokIdAndTagId(any(), any())).thenReturn(Optional.empty());

        // When
        tagService.removeTag(pokId, userTag.getId(), userId);

        // Then — no delete called, no exception
        verify(pokTagRepository, never()).delete(any());
    }

    // ===== assignTagsToNewPok =====

    @Test
    void assignTagsToNewPok_withValidTags_shouldSaveAllPokTags() {
        // Given
        UUID pokId = UUID.randomUUID();
        Tag tag1 = new Tag("java");
        Tag tag2 = new Tag("spring");
        ReflectionTestUtils.setField(tag1, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(tag2, "id", UUID.randomUUID());
        UserTag userTag1 = new UserTag(userId, tag1, "blue");
        UserTag userTag2 = new UserTag(userId, tag2, "green");
        UUID userTagId1 = UUID.randomUUID();
        UUID userTagId2 = UUID.randomUUID();
        ReflectionTestUtils.setField(userTag1, "id", userTagId1);
        ReflectionTestUtils.setField(userTag2, "id", userTagId2);

        when(userTagRepository.findById(userTagId1)).thenReturn(Optional.of(userTag1));
        when(userTagRepository.findById(userTagId2)).thenReturn(Optional.of(userTag2));

        // When
        tagService.assignTagsToNewPok(pokId, List.of(userTagId1, userTagId2), userId);

        // Then
        @SuppressWarnings("unchecked")
        ArgumentCaptor<Iterable<PokTag>> captor = ArgumentCaptor.forClass((Class<Iterable<PokTag>>) (Class<?>) Iterable.class);
        verify(pokTagRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).hasSize(2);
    }

    @Test
    void assignTagsToNewPok_withNullList_shouldDoNothing() {
        // When
        tagService.assignTagsToNewPok(UUID.randomUUID(), null, userId);

        // Then
        verify(pokTagRepository, never()).saveAll(any());
    }

    @Test
    void assignTagsToNewPok_withEmptyList_shouldDoNothing() {
        // When
        tagService.assignTagsToNewPok(UUID.randomUUID(), List.of(), userId);

        // Then
        verify(pokTagRepository, never()).saveAll(any());
    }

    @Test
    void assignTagsToNewPok_withInvalidTagId_shouldIgnoreAndContinue() {
        // Given
        UUID pokId = UUID.randomUUID();
        UUID invalidTagId = UUID.randomUUID();
        Tag tag = new Tag("java");
        ReflectionTestUtils.setField(tag, "id", UUID.randomUUID());
        UserTag userTag = new UserTag(userId, tag, "blue");
        UUID validTagId = UUID.randomUUID();
        ReflectionTestUtils.setField(userTag, "id", validTagId);

        when(userTagRepository.findById(invalidTagId)).thenReturn(Optional.empty());
        when(userTagRepository.findById(validTagId)).thenReturn(Optional.of(userTag));

        // When — no exception
        tagService.assignTagsToNewPok(pokId, List.of(invalidTagId, validTagId), userId);

        // Then — only the valid tag is saved
        @SuppressWarnings("unchecked")
        ArgumentCaptor<Iterable<PokTag>> captor = ArgumentCaptor.forClass((Class<Iterable<PokTag>>) (Class<?>) Iterable.class);
        verify(pokTagRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).hasSize(1);
    }

    @Test
    void assignTagsToNewPok_withDuplicateTagIds_shouldDedup() {
        // Given
        UUID pokId = UUID.randomUUID();
        Tag tag = new Tag("java");
        ReflectionTestUtils.setField(tag, "id", UUID.randomUUID());
        UserTag userTag = new UserTag(userId, tag, "blue");
        UUID userTagId = UUID.randomUUID();
        ReflectionTestUtils.setField(userTag, "id", userTagId);

        when(userTagRepository.findById(userTagId)).thenReturn(Optional.of(userTag));

        // When — same tagId twice
        tagService.assignTagsToNewPok(pokId, List.of(userTagId, userTagId), userId);

        // Then — only one PokTag saved
        @SuppressWarnings("unchecked")
        ArgumentCaptor<Iterable<PokTag>> captor = ArgumentCaptor.forClass((Class<Iterable<PokTag>>) (Class<?>) Iterable.class);
        verify(pokTagRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).hasSize(1);
    }
}
