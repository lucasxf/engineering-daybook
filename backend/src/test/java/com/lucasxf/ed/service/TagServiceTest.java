package com.lucasxf.ed.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
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

    // ===== normalise — whitespace edge cases =====

    @Test
    void normalise_shouldCollapseTabsAndMultipleSpacesToSingleDash() {
        assertThat(TagService.normalise("spring\tboot")).containsExactly("spring-boot", "spring-boot");
        assertThat(TagService.normalise("spring  boot")).containsExactly("spring-boot", "spring-boot");
        assertThat(TagService.normalise("  hello   world  ")).containsExactly("hello-world", "hello-world");
    }

    // ===== createOrReuse — normalisation =====

    @ParameterizedTest(name = "input=''{0}'' → name=''{1}'' displayName=''{2}''")
    @CsvSource({
        "spring boot,       spring-boot,  spring-boot",
        "Spring Boot,       spring-boot,  Spring-Boot",
        "CLAUDE CODE,       claude-code,  CLAUDE-CODE",
        "  spring boot  ,   spring-boot,  spring-boot",
        "spring-boot,       spring-boot,  spring-boot",
        "java,              java,          java",
        "spring  boot,      spring-boot,  spring-boot",
    })
    void createOrReuse_shouldNormaliseNameAndPreserveDisplayName(
            String input, String expectedName, String expectedDisplayName) {
        // Given
        Tag savedTag = new Tag(expectedName, expectedDisplayName);
        UserTag savedUserTag = new UserTag(userId, savedTag, "blue");

        when(userTagRepository.existsByUserIdAndTagNameAndDeletedAtIsNull(eq(userId), eq(expectedName)))
                .thenReturn(false);
        when(tagRepository.findByName(expectedName)).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenReturn(savedTag);
        when(userTagRepository.save(any(UserTag.class))).thenReturn(savedUserTag);

        // When
        tagService.createOrReuse(new CreateTagRequest(input), userId);

        // Then — Tag saved with canonical name and displayName
        ArgumentCaptor<Tag> tagCaptor = ArgumentCaptor.forClass(Tag.class);
        verify(tagRepository).save(tagCaptor.capture());
        assertThat(tagCaptor.getValue().getName()).isEqualTo(expectedName);
        assertThat(tagCaptor.getValue().getDisplayName()).isEqualTo(expectedDisplayName);
    }

    @Test
    void createOrReuse_withExistingCanonicalTag_shouldReuseGlobalAndCreateSubscription() {
        // Given — user types "Spring Boot"; canonical is "spring-boot" which already exists
        Tag existingGlobal = new Tag("spring-boot", "spring-boot");
        UserTag savedUserTag = new UserTag(userId, existingGlobal, "red");

        when(userTagRepository.existsByUserIdAndTagNameAndDeletedAtIsNull(userId, "spring-boot"))
                .thenReturn(false);
        when(tagRepository.findByName("spring-boot")).thenReturn(Optional.of(existingGlobal));
        when(userTagRepository.save(any(UserTag.class))).thenReturn(savedUserTag);

        // When
        TagResponse response = tagService.createOrReuse(new CreateTagRequest("Spring Boot"), userId);

        // Then — no new global tag created; subscription created with existing global
        assertThat(response.name()).isEqualTo("spring-boot");
        verify(tagRepository, never()).save(any());
        verify(userTagRepository).save(any(UserTag.class));
    }

    @Test
    void createOrReuse_withDuplicateInUserActiveSet_shouldReturnExistingIdempotently() {
        // Given — canonical "docker" already subscribed
        Tag globalTag = new Tag("docker", "docker");
        UserTag existingUserTag = new UserTag(userId, globalTag, "green");

        when(userTagRepository.existsByUserIdAndTagNameAndDeletedAtIsNull(userId, "docker"))
                .thenReturn(true);
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(userId))
                .thenReturn(List.of(existingUserTag));

        // When
        TagResponse response = tagService.createOrReuse(new CreateTagRequest("docker"), userId);

        // Then — no new records created, existing tag returned
        assertThat(response.name()).isEqualTo("docker");
        verify(tagRepository, never()).save(any());
        verify(userTagRepository, never()).save(any());
    }

    @Test
    void createOrReuse_withSpacedInputMatchingExistingSubscription_shouldReturnIdempotently() {
        // Given — user types "Spring Boot"; canonical "spring-boot" already subscribed
        Tag globalTag = new Tag("spring-boot", "spring-boot");
        UserTag existingUserTag = new UserTag(userId, globalTag, "blue");

        when(userTagRepository.existsByUserIdAndTagNameAndDeletedAtIsNull(userId, "spring-boot"))
                .thenReturn(true);
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(userId))
                .thenReturn(List.of(existingUserTag));

        // When
        TagResponse response = tagService.createOrReuse(new CreateTagRequest("Spring Boot"), userId);

        // Then — idempotent, no new records
        assertThat(response.name()).isEqualTo("spring-boot");
        verify(tagRepository, never()).save(any());
        verify(userTagRepository, never()).save(any());
    }

    // ===== getUserTags =====

    @Test
    void getUserTags_shouldReturnOnlyActiveSubscriptions() {
        // Given
        Tag tag = new Tag("java", "java");
        UserTag activeTag = new UserTag(userId, tag, "blue");
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(userId)).thenReturn(List.of(activeTag));

        // When
        List<TagResponse> result = tagService.getUserTags(userId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("java");
        assertThat(result.get(0).displayName()).isEqualTo("java");
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
    void renameTag_shouldNormaliseNewNameAndCreateNewSubscription() {
        // Given — rename to "Kube Tools" → canonical "kube-tools", displayName "Kube-Tools"
        Tag oldGlobalTag = new Tag("k8s", "k8s");
        UserTag oldUserTag = new UserTag(userId, oldGlobalTag, "purple");
        Tag newGlobalTag = new Tag("kube-tools", "Kube-Tools");
        UserTag newUserTag = new UserTag(userId, newGlobalTag, "purple");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(oldUserTag));
        when(userTagRepository.existsByUserIdAndTagNameAndDeletedAtIsNull(userId, "kube-tools"))
                .thenReturn(false);
        when(tagRepository.findByName("kube-tools")).thenReturn(Optional.of(newGlobalTag));
        when(userTagRepository.save(any(UserTag.class))).thenReturn(newUserTag);
        when(pokRepository.findIdsByUserId(userId)).thenReturn(List.of());

        // When
        TagResponse response = tagService.renameTag(
                oldUserTag.getId(), new UpdateTagRequest("Kube Tools"), userId);

        // Then
        assertThat(response.name()).isEqualTo("kube-tools");
        assertThat(response.displayName()).isEqualTo("Kube-Tools");
        assertThat(oldUserTag.isActive()).isFalse();
    }

    @Test
    void renameTag_withConflictingCanonicalName_shouldThrowTagConflictException() {
        // Given — user already has "kube-tools"; trying to rename to "Kube Tools" → same canonical
        Tag tag = new Tag("k8s", "k8s");
        UserTag userTag = new UserTag(userId, tag, "blue");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(userTag));
        when(userTagRepository.existsByUserIdAndTagNameAndDeletedAtIsNull(userId, "kube-tools"))
                .thenReturn(true);

        // When/Then
        assertThatThrownBy(() ->
                tagService.renameTag(userTag.getId(), new UpdateTagRequest("Kube Tools"), userId))
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
        Tag tag = new Tag("java", "java");
        UserTag anotherUsersTag = new UserTag(anotherUserId, tag, "blue");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(anotherUsersTag));

        // When/Then
        assertThatThrownBy(() ->
                tagService.renameTag(anotherUsersTag.getId(), new UpdateTagRequest("java2"), userId))
                .isInstanceOf(TagNotFoundException.class);
    }

    // ===== deleteTag =====

    @Test
    void deleteTag_shouldSoftDeleteSubscriptionAndRemovePokTagAssignments() {
        // Given
        Tag tag = new Tag("legacy", "legacy");
        UserTag userTag = new UserTag(userId, tag, "red");
        List<UUID> userPokIds = List.of(UUID.randomUUID(), UUID.randomUUID());

        when(userTagRepository.findById(any())).thenReturn(Optional.of(userTag));
        when(pokRepository.findIdsByUserId(userId)).thenReturn(userPokIds);

        // When
        tagService.deleteTag(userTag.getId(), userId);

        // Then
        assertThat(userTag.isActive()).isFalse();
        verify(pokTagRepository).deleteByTagIdAndPokIdIn(any(), any());
        verify(userTagRepository).save(userTag);
    }

    @Test
    void deleteTag_withTagOwnedByAnotherUser_shouldThrowTagNotFoundException() {
        // Given
        UUID anotherUserId = UUID.randomUUID();
        Tag tag = new Tag("shared", "shared");
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
        Tag tag = new Tag("java", "java");
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
        Tag tag = new Tag("java", "java");
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
        Tag tag = new Tag("java", "java");
        UserTag userTag = new UserTag(userId, tag, "blue");
        PokTag pokTag = new PokTag(pokId, tag.getId(), PokTag.Source.MANUAL);
        Pok pok = new Pok(userId, "title", "content");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(userTag));
        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(pokTagRepository.findByPokIdAndTagId(any(), any())).thenReturn(Optional.of(pokTag));

        // When
        tagService.removeTag(pokId, userTag.getId(), userId);

        // Then
        verify(pokTagRepository).delete(pokTag);
    }

    @Test
    void removeTag_withNonExistentAssignment_shouldDoNothingGracefully() {
        // Given
        UUID pokId = UUID.randomUUID();
        Tag tag = new Tag("java", "java");
        UserTag userTag = new UserTag(userId, tag, "blue");
        Pok pok = new Pok(userId, "title", "content");

        when(userTagRepository.findById(any())).thenReturn(Optional.of(userTag));
        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(pokTagRepository.findByPokIdAndTagId(any(), any())).thenReturn(Optional.empty());

        // When
        tagService.removeTag(pokId, userTag.getId(), userId);

        // Then
        verify(pokTagRepository, never()).delete(any());
    }

    // ===== assignTagsToNewPok =====

    @Test
    void assignTagsToNewPok_withValidTags_shouldSaveAllPokTags() {
        // Given
        UUID pokId = UUID.randomUUID();
        Tag tag1 = new Tag("java", "java");
        Tag tag2 = new Tag("spring", "spring");
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
        ArgumentCaptor<Iterable<PokTag>> captor =
                ArgumentCaptor.forClass((Class<Iterable<PokTag>>) (Class<?>) Iterable.class);
        verify(pokTagRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).hasSize(2);
    }

    @Test
    void assignTagsToNewPok_withNullList_shouldDoNothing() {
        tagService.assignTagsToNewPok(UUID.randomUUID(), null, userId);
        verify(pokTagRepository, never()).saveAll(any());
    }

    @Test
    void assignTagsToNewPok_withEmptyList_shouldDoNothing() {
        tagService.assignTagsToNewPok(UUID.randomUUID(), List.of(), userId);
        verify(pokTagRepository, never()).saveAll(any());
    }

    @Test
    void assignTagsToNewPok_withInvalidTagId_shouldIgnoreAndContinue() {
        // Given
        UUID pokId = UUID.randomUUID();
        UUID invalidTagId = UUID.randomUUID();
        Tag tag = new Tag("java", "java");
        ReflectionTestUtils.setField(tag, "id", UUID.randomUUID());
        UserTag userTag = new UserTag(userId, tag, "blue");
        UUID validTagId = UUID.randomUUID();
        ReflectionTestUtils.setField(userTag, "id", validTagId);

        when(userTagRepository.findById(invalidTagId)).thenReturn(Optional.empty());
        when(userTagRepository.findById(validTagId)).thenReturn(Optional.of(userTag));

        // When
        tagService.assignTagsToNewPok(pokId, List.of(invalidTagId, validTagId), userId);

        // Then — only the valid tag is saved
        @SuppressWarnings("unchecked")
        ArgumentCaptor<Iterable<PokTag>> captor =
                ArgumentCaptor.forClass((Class<Iterable<PokTag>>) (Class<?>) Iterable.class);
        verify(pokTagRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).hasSize(1);
    }

    @Test
    void assignTagsToNewPok_withDuplicateTagIds_shouldDedup() {
        // Given
        UUID pokId = UUID.randomUUID();
        Tag tag = new Tag("java", "java");
        ReflectionTestUtils.setField(tag, "id", UUID.randomUUID());
        UserTag userTag = new UserTag(userId, tag, "blue");
        UUID userTagId = UUID.randomUUID();
        ReflectionTestUtils.setField(userTag, "id", userTagId);

        when(userTagRepository.findById(userTagId)).thenReturn(Optional.of(userTag));

        // When — same tagId twice
        tagService.assignTagsToNewPok(pokId, List.of(userTagId, userTagId), userId);

        // Then — only one PokTag saved
        @SuppressWarnings("unchecked")
        ArgumentCaptor<Iterable<PokTag>> captor =
                ArgumentCaptor.forClass((Class<Iterable<PokTag>>) (Class<?>) Iterable.class);
        verify(pokTagRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).hasSize(1);
    }
}
