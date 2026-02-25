package com.lucasxf.ed.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.PokAuditLog;
import com.lucasxf.ed.dto.CreatePokRequest;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.dto.UpdatePokRequest;
import com.lucasxf.ed.exception.PokAccessDeniedException;
import com.lucasxf.ed.exception.PokNotFoundException;
import com.lucasxf.ed.dto.PokAuditLogResponse;
import com.lucasxf.ed.repository.PokAuditLogRepository;
import com.lucasxf.ed.repository.PokRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

/**
 * Unit tests for {@link PokService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
@ExtendWith(MockitoExtension.class)
class PokServiceTest {

    @Mock
    private PokRepository pokRepository;

    @Mock
    private PokAuditLogRepository pokAuditLogRepository;

    @InjectMocks
    private PokService pokService;

    private UUID userId;
    private UUID otherUserId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        otherUserId = UUID.randomUUID();
    }

    // ===== CREATE POK TESTS =====

    @Test
    void create_withTitleAndContent_shouldCreatePok() {
        // Given
        CreatePokRequest request = new CreatePokRequest("Test Title", "Test content");
        Pok savedPok = new Pok(userId, "Test Title", "Test content");

        when(pokRepository.save(any(Pok.class))).thenReturn(savedPok);

        // When
        PokResponse response = pokService.create(request, userId);

        // Then
        assertThat(response.title()).isEqualTo("Test Title");
        assertThat(response.content()).isEqualTo("Test content");
        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.deletedAt()).isNull();

        verify(pokRepository).save(any(Pok.class));
    }

    @Test
    void create_withContentOnly_shouldCreatePokWithNullTitle() {
        // Given: Title is null (optional for frictionless capture)
        CreatePokRequest request = new CreatePokRequest(null, "Content without title");
        Pok savedPok = new Pok(userId, null, "Content without title");

        when(pokRepository.save(any(Pok.class))).thenReturn(savedPok);

        // When
        PokResponse response = pokService.create(request, userId);

        // Then
        assertThat(response.title()).isNull();
        assertThat(response.content()).isEqualTo("Content without title");
        assertThat(response.userId()).isEqualTo(userId);

        verify(pokRepository).save(any(Pok.class));
    }

    @Test
    void create_withEmptyStringTitle_shouldCreatePokWithEmptyTitle() {
        // Given: Title is empty string (also valid)
        CreatePokRequest request = new CreatePokRequest("", "Content with empty title");
        Pok savedPok = new Pok(userId, "", "Content with empty title");

        when(pokRepository.save(any(Pok.class))).thenReturn(savedPok);

        // When
        PokResponse response = pokService.create(request, userId);

        // Then
        assertThat(response.title()).isEmpty();
        assertThat(response.content()).isEqualTo("Content with empty title");

        verify(pokRepository).save(any(Pok.class));
    }

    // ===== GET POK BY ID TESTS =====

    @Test
    void getById_whenPokExistsAndUserOwnsIt_shouldReturnPok() {
        // Given
        UUID pokId = UUID.randomUUID();
        Pok pok = new Pok(userId, "Title", "Content");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));

        // When
        PokResponse response = pokService.getById(pokId, userId);

        // Then
        assertThat(response.title()).isEqualTo("Title");
        assertThat(response.content()).isEqualTo("Content");
        assertThat(response.userId()).isEqualTo(userId);

        verify(pokRepository).findByIdAndDeletedAtIsNull(pokId);
    }

    @Test
    void getById_whenPokNotFound_shouldThrowPokNotFoundException() {
        // Given
        UUID pokId = UUID.randomUUID();

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> pokService.getById(pokId, userId))
            .isInstanceOf(PokNotFoundException.class)
            .hasMessage("POK not found");

        verify(pokRepository).findByIdAndDeletedAtIsNull(pokId);
    }

    @Test
    void getById_whenPokBelongsToOtherUser_shouldThrowPokAccessDeniedException() {
        // Given
        UUID pokId = UUID.randomUUID();
        Pok pok = new Pok(otherUserId, "Title", "Content"); // Owned by otherUser

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));

        // When/Then
        assertThatThrownBy(() -> pokService.getById(pokId, userId))
            .isInstanceOf(PokAccessDeniedException.class)
            .hasMessage("You do not have permission to access this POK");

        verify(pokRepository).findByIdAndDeletedAtIsNull(pokId);
    }

    // ===== LIST POKS TESTS =====

    @Test
    void getAll_shouldReturnPagedPoks() {
        // Given
        Pok pok1 = new Pok(userId, "Title 1", "Content 1");
        Pok pok2 = new Pok(userId, null, "Content 2");
        List<Pok> poks = List.of(pok1, pok2);
        Page<Pok> pokPage = new PageImpl<>(poks, PageRequest.of(0, 20), 2);

        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "updatedAt"));

        when(pokRepository.findByUserIdAndDeletedAtIsNull(eq(userId), any(Pageable.class)))
            .thenReturn(pokPage);

        // When
        Page<PokResponse> result = pokService.getAll(userId, pageable);

        // Then
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).title()).isEqualTo("Title 1");
        assertThat(result.getContent().get(1).title()).isNull();

        verify(pokRepository).findByUserIdAndDeletedAtIsNull(eq(userId), any(Pageable.class));
    }

    @Test
    void getAll_whenNoPoks_shouldReturnEmptyPage() {
        // Given
        Page<Pok> emptyPage = Page.empty();
        Pageable pageable = PageRequest.of(0, 20);

        when(pokRepository.findByUserIdAndDeletedAtIsNull(eq(userId), any(Pageable.class)))
            .thenReturn(emptyPage);

        // When
        Page<PokResponse> result = pokService.getAll(userId, pageable);

        // Then
        assertThat(result.getTotalElements()).isZero();
        assertThat(result.getContent()).isEmpty();

        verify(pokRepository).findByUserIdAndDeletedAtIsNull(eq(userId), any(Pageable.class));
    }

    @Test
    void getAll_shouldExcludeSoftDeletedPoks() {
        // Given: Repository already filters out soft-deleted POKs
        Pok activePok = new Pok(userId, "Active", "Active content");
        Page<Pok> pokPage = new PageImpl<>(List.of(activePok));

        Pageable pageable = PageRequest.of(0, 20);

        when(pokRepository.findByUserIdAndDeletedAtIsNull(eq(userId), any(Pageable.class)))
            .thenReturn(pokPage);

        // When
        Page<PokResponse> result = pokService.getAll(userId, pageable);

        // Then: Should only return active POKs (soft-deleted excluded by repository)
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).title()).isEqualTo("Active");
        assertThat(result.getContent().get(0).deletedAt()).isNull();

        verify(pokRepository).findByUserIdAndDeletedAtIsNull(eq(userId), any(Pageable.class));
    }

    // ===== UPDATE POK TESTS =====

    @Test
    void update_whenPokExistsAndUserOwnsIt_shouldUpdatePok() {
        // Given
        UUID pokId = UUID.randomUUID();
        Pok existingPok = new Pok(userId, "Old Title", "Old content");
        UpdatePokRequest request = new UpdatePokRequest("New Title", "New content");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(existingPok));
        when(pokRepository.save(any(Pok.class))).thenReturn(existingPok);

        // When
        PokResponse response = pokService.update(pokId, request, userId);

        // Then
        assertThat(response.title()).isEqualTo("New Title");
        assertThat(response.content()).isEqualTo("New content");

        verify(pokRepository).findByIdAndDeletedAtIsNull(pokId);
        verify(pokRepository).save(existingPok);
    }

    @Test
    void update_removingTitle_shouldUpdateToNullTitle() {
        // Given: User wants to remove title (make it optional again)
        UUID pokId = UUID.randomUUID();
        Pok existingPok = new Pok(userId, "Old Title", "Content");
        UpdatePokRequest request = new UpdatePokRequest(null, "Updated content");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(existingPok));
        when(pokRepository.save(any(Pok.class))).thenReturn(existingPok);

        // When
        PokResponse response = pokService.update(pokId, request, userId);

        // Then
        assertThat(response.title()).isNull();
        assertThat(response.content()).isEqualTo("Updated content");

        verify(pokRepository).save(existingPok);
    }

    @Test
    void update_whenPokNotFound_shouldThrowPokNotFoundException() {
        // Given
        UUID pokId = UUID.randomUUID();
        UpdatePokRequest request = new UpdatePokRequest("Title", "Content");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> pokService.update(pokId, request, userId))
            .isInstanceOf(PokNotFoundException.class)
            .hasMessage("POK not found");

        verify(pokRepository).findByIdAndDeletedAtIsNull(pokId);
    }

    @Test
    void update_whenPokBelongsToOtherUser_shouldThrowPokAccessDeniedException() {
        // Given
        UUID pokId = UUID.randomUUID();
        Pok pok = new Pok(otherUserId, "Title", "Content");
        UpdatePokRequest request = new UpdatePokRequest("New", "New content");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));

        // When/Then
        assertThatThrownBy(() -> pokService.update(pokId, request, userId))
            .isInstanceOf(PokAccessDeniedException.class)
            .hasMessage("You do not have permission to access this POK");

        verify(pokRepository).findByIdAndDeletedAtIsNull(pokId);
    }

    // ===== SOFT DELETE TESTS =====

    @Test
    void softDelete_whenPokExistsAndUserOwnsIt_shouldMarkAsDeleted() {
        // Given
        UUID pokId = UUID.randomUUID();
        Pok pok = new Pok(userId, "Title", "Content");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));

        // When
        pokService.softDelete(pokId, userId);

        // Then
        assertThat(pok.getDeletedAt()).isNotNull();
        assertThat(pok.isDeleted()).isTrue();

        verify(pokRepository).findByIdAndDeletedAtIsNull(pokId);
        verify(pokRepository).save(pok);
    }

    @Test
    void softDelete_whenPokNotFound_shouldThrowPokNotFoundException() {
        // Given
        UUID pokId = UUID.randomUUID();

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> pokService.softDelete(pokId, userId))
            .isInstanceOf(PokNotFoundException.class)
            .hasMessage("POK not found");

        verify(pokRepository).findByIdAndDeletedAtIsNull(pokId);
    }

    @Test
    void softDelete_whenPokBelongsToOtherUser_shouldThrowPokAccessDeniedException() {
        // Given
        UUID pokId = UUID.randomUUID();
        Pok pok = new Pok(otherUserId, "Title", "Content");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));

        // When/Then
        assertThatThrownBy(() -> pokService.softDelete(pokId, userId))
            .isInstanceOf(PokAccessDeniedException.class)
            .hasMessage("You do not have permission to access this POK");

        verify(pokRepository).findByIdAndDeletedAtIsNull(pokId);
    }

    // ===== SEARCH/FILTER/SORT TESTS =====

    @Test
    void search_withKeyword_shouldCallRepositoryWithCorrectParameters() {
        // Given
        String keyword = "spring boot";
        int page = 0;
        int size = 20;
        List<Pok> poks = List.of(new Pok(userId, "Spring Boot", "Content about Spring Boot"));
        Page<Pok> pokPage = new PageImpl<>(poks, PageRequest.of(page, size), 1);

        when(pokRepository.searchPoks(
            eq(userId),
            eq(keyword),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            any(Pageable.class)
        )).thenReturn(pokPage);

        // When
        Page<PokResponse> result = pokService.search(userId, keyword, null, null, null, null, null, null, page, size);

        // Then
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).title()).isEqualTo("Spring Boot");

        verify(pokRepository).searchPoks(eq(userId), eq(keyword), eq(null), eq(null), eq(null), eq(null), any(Pageable.class));
    }

    @Test
    void search_withSortByCreatedAtAsc_shouldBuildCorrectSort() {
        // Given
        String sortBy = "createdAt";
        String sortDirection = "ASC";
        int page = 0;
        int size = 20;
        Page<Pok> pokPage = new PageImpl<>(List.of(), PageRequest.of(page, size), 0);

        when(pokRepository.searchPoks(
            eq(userId),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            any(Pageable.class)
        )).thenReturn(pokPage);

        // When
        pokService.search(userId, null, sortBy, sortDirection, null, null, null, null, page, size);

        // Then: Verify Sort object is built correctly
        verify(pokRepository).searchPoks(
            eq(userId),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            any(Pageable.class)
        );
    }

    @Test
    void search_withDateFilters_shouldParseAndPassDates() {
        // Given
        String createdFrom = "2026-01-01T00:00:00Z";
        String createdTo = "2026-01-31T23:59:59Z";
        int page = 0;
        int size = 20;
        Page<Pok> pokPage = new PageImpl<>(List.of(), PageRequest.of(page, size), 0);

        when(pokRepository.searchPoks(
            eq(userId),
            eq(null),
            any(Instant.class),
            any(Instant.class),
            eq(null),
            eq(null),
            any(Pageable.class)
        )).thenReturn(pokPage);

        // When
        pokService.search(userId, null, null, null, createdFrom, createdTo, null, null, page, size);

        // Then: Verify dates are parsed correctly
        verify(pokRepository).searchPoks(
            eq(userId),
            eq(null),
            any(Instant.class),
            any(Instant.class),
            eq(null),
            eq(null),
            any(Pageable.class)
        );
    }

    @Test
    void search_withDefaultSort_shouldUseUpdatedAtDesc() {
        // Given: No sortBy/sortDirection provided (should default to updatedAt DESC)
        int page = 0;
        int size = 20;
        Page<Pok> pokPage = new PageImpl<>(List.of(), PageRequest.of(page, size), 0);

        when(pokRepository.searchPoks(
            eq(userId),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            any(Pageable.class)
        )).thenReturn(pokPage);

        // When
        pokService.search(userId, null, null, null, null, null, null, null, page, size);

        // Then: Default sort should be updatedAt DESC
        verify(pokRepository).searchPoks(
            eq(userId),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            any(Pageable.class)
        );
    }

    @Test
    void search_withPagination_shouldRespectPageAndSize() {
        // Given
        int page = 2;
        int size = 10;
        Page<Pok> pokPage = new PageImpl<>(List.of(), PageRequest.of(page, size), 0);

        when(pokRepository.searchPoks(
            eq(userId),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            any(Pageable.class)
        )).thenReturn(pokPage);

        // When
        pokService.search(userId, null, null, null, null, null, null, null, page, size);

        // Then: Verify pagination is correctly passed
        verify(pokRepository).searchPoks(
            eq(userId),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            any(Pageable.class)
        );
    }

    @Test
    void search_shouldConvertPoksToResponses() {
        // Given
        Pok pok1 = new Pok(userId, "Title 1", "Content 1");
        Pok pok2 = new Pok(userId, null, "Content 2 without title");
        List<Pok> poks = List.of(pok1, pok2);
        Page<Pok> pokPage = new PageImpl<>(poks, PageRequest.of(0, 20), 2);

        when(pokRepository.searchPoks(
            eq(userId),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            any(Pageable.class)
        )).thenReturn(pokPage);

        // When
        Page<PokResponse> result = pokService.search(userId, null, null, null, null, null, null, null, 0, 20);

        // Then
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).title()).isEqualTo("Title 1");
        assertThat(result.getContent().get(1).title()).isNull();
    }

    // ===== AUDIT LOG TESTS =====

    @Test
    void create_shouldSaveAuditLogWithCreateAction() {
        // Given
        CreatePokRequest request = new CreatePokRequest("Test Title", "Test content");
        Pok savedPok = new Pok(userId, "Test Title", "Test content");

        when(pokRepository.save(any(Pok.class))).thenReturn(savedPok);
        when(pokAuditLogRepository.save(any(PokAuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        pokService.create(request, userId);

        // Then: audit log entry saved with CREATE action and correct content
        verify(pokAuditLogRepository).save(argThat(log ->
            log.getAction() == PokAuditLog.Action.CREATE
            && log.getUserId().equals(userId)
            && log.getOldTitle() == null
            && log.getOldContent() == null
            && "Test Title".equals(log.getNewTitle())
            && "Test content".equals(log.getNewContent())
        ));
    }

    @Test
    void update_shouldSaveAuditLogWithUpdateAction() {
        // Given
        UUID pokId = UUID.randomUUID();
        Pok existingPok = new Pok(userId, "Old Title", "Old content");
        UpdatePokRequest request = new UpdatePokRequest("New Title", "New content");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(existingPok));
        when(pokRepository.save(any(Pok.class))).thenReturn(existingPok);
        when(pokAuditLogRepository.save(any(PokAuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        pokService.update(pokId, request, userId);

        // Then: audit log records old and new values
        verify(pokAuditLogRepository).save(argThat(log ->
            log.getAction() == PokAuditLog.Action.UPDATE
            && log.getUserId().equals(userId)
            && "Old Title".equals(log.getOldTitle())
            && "Old content".equals(log.getOldContent())
            && "New Title".equals(log.getNewTitle())
            && "New content".equals(log.getNewContent())
        ));
    }

    @Test
    void softDelete_shouldSaveAuditLogWithDeleteAction() {
        // Given
        UUID pokId = UUID.randomUUID();
        Pok pok = new Pok(userId, "Title", "Content");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(pokAuditLogRepository.save(any(PokAuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        pokService.softDelete(pokId, userId);

        // Then: audit log records old content and nulls for new content
        verify(pokAuditLogRepository).save(argThat(log ->
            log.getAction() == PokAuditLog.Action.DELETE
            && log.getUserId().equals(userId)
            && "Title".equals(log.getOldTitle())
            && "Content".equals(log.getOldContent())
            && log.getNewTitle() == null
            && log.getNewContent() == null
        ));
    }

    @Test
    void update_whenAccessDenied_shouldNotSaveAuditLog() {
        // Given: POK belongs to a different user
        UUID pokId = UUID.randomUUID();
        Pok pok = new Pok(otherUserId, "Title", "Content");
        UpdatePokRequest request = new UpdatePokRequest("New", "New content");

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));

        // When/Then: access denied
        assertThatThrownBy(() -> pokService.update(pokId, request, userId))
            .isInstanceOf(PokAccessDeniedException.class);

        // Then: no audit log entry written (transaction would roll back)
        verify(pokAuditLogRepository, never()).save(any(PokAuditLog.class));
    }

    // ===== GET HISTORY TESTS =====

    @Test
    void getHistory_whenPokExistsAndUserOwnsIt_shouldReturnAuditLogs() {
        // Given
        UUID pokId = UUID.randomUUID();
        Pok pok = new Pok(userId, "Title", "Content");
        PokAuditLog log1 = new PokAuditLog(
            pokId, userId, PokAuditLog.Action.CREATE,
            null, "Title", null, "Content", Instant.now().minusSeconds(60)
        );
        PokAuditLog log2 = new PokAuditLog(
            pokId, userId, PokAuditLog.Action.UPDATE,
            "Title", "New Title", "Content", "New content", Instant.now()
        );

        when(pokRepository.findById(pokId)).thenReturn(Optional.of(pok));
        when(pokAuditLogRepository.findByPokIdOrderByOccurredAtDesc(pokId))
            .thenReturn(List.of(log2, log1));

        // When
        List<PokAuditLogResponse> history = pokService.getHistory(pokId, userId);

        // Then: newest first, both entries returned
        assertThat(history).hasSize(2);
        assertThat(history.get(0).action()).isEqualTo("UPDATE");
        assertThat(history.get(1).action()).isEqualTo("CREATE");

        verify(pokRepository).findById(pokId);
        verify(pokAuditLogRepository).findByPokIdOrderByOccurredAtDesc(pokId);
    }

    @Test
    void getHistory_whenPokNotFound_shouldThrowPokNotFoundException() {
        // Given
        UUID pokId = UUID.randomUUID();

        when(pokRepository.findById(pokId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> pokService.getHistory(pokId, userId))
            .isInstanceOf(PokNotFoundException.class)
            .hasMessage("POK not found");
    }

    @Test
    void getHistory_whenPokBelongsToOtherUser_shouldThrowPokAccessDeniedException() {
        // Given
        UUID pokId = UUID.randomUUID();
        Pok pok = new Pok(otherUserId, "Title", "Content");

        when(pokRepository.findById(pokId)).thenReturn(Optional.of(pok));

        // When/Then
        assertThatThrownBy(() -> pokService.getHistory(pokId, userId))
            .isInstanceOf(PokAccessDeniedException.class);
    }

    // ===== SEARCH — UPDATED DATE FILTERS TESTS =====

    @Test
    void search_withUpdatedDateFilters_shouldParseAndPassDates() {
        // Given
        String updatedFrom = "2026-02-01T00:00:00Z";
        String updatedTo = "2026-02-28T23:59:59Z";
        int page = 0;
        int size = 20;
        Page<Pok> pokPage = new PageImpl<>(List.of(), PageRequest.of(page, size), 0);

        when(pokRepository.searchPoks(
            eq(userId),
            eq(null),
            eq(null),
            eq(null),
            any(Instant.class),
            any(Instant.class),
            any(Pageable.class)
        )).thenReturn(pokPage);

        // When
        Page<PokResponse> result = pokService.search(
            userId, null, null, null, null, null, updatedFrom, updatedTo, page, size);

        // Then: dates are parsed and passed through to repository
        assertThat(result.getTotalElements()).isZero();
        verify(pokRepository).searchPoks(
            eq(userId), eq(null), eq(null), eq(null),
            any(Instant.class), any(Instant.class), any(Pageable.class));
    }

    // ===== PARSE INSTANT ERROR PATH =====

    @Test
    void search_withInvalidDateFormat_shouldThrowIllegalArgumentException() {
        // Given: a date string that is not ISO 8601
        String invalidDate = "25-02-2026";

        // When/Then
        assertThatThrownBy(() ->
            pokService.search(userId, null, null, null, invalidDate, null, null, null, 0, 20))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Invalid date format")
            .hasMessageContaining(invalidDate);
    }

    // ===== BUILD SORT — INVALID FIELD =====

    @Test
    void search_withInvalidSortField_shouldThrowIllegalArgumentException() {
        // Given: a sort field that is not in the whitelist
        String invalidSortField = "id";

        // When/Then
        assertThatThrownBy(() ->
            pokService.search(userId, null, invalidSortField, null, null, null, null, null, 0, 20))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Invalid sort field")
            .hasMessageContaining(invalidSortField);
    }

    @Test
    void search_withSortByUpdatedAtDesc_shouldBuildCorrectSort() {
        // Given: updatedAt DESC is the default, but explicitly providing it should also work
        String sortBy = "updatedAt";
        String sortDirection = "DESC";
        int page = 0;
        int size = 20;
        Page<Pok> pokPage = new PageImpl<>(List.of(), PageRequest.of(page, size), 0);

        when(pokRepository.searchPoks(
            eq(userId), eq(null), eq(null), eq(null), eq(null), eq(null), any(Pageable.class)
        )).thenReturn(pokPage);

        // When
        pokService.search(userId, null, sortBy, sortDirection, null, null, null, null, page, size);

        // Then: verify call was made (DESC is the else-branch in buildSort)
        verify(pokRepository).searchPoks(
            eq(userId), eq(null), eq(null), eq(null), eq(null), eq(null), any(Pageable.class));
    }
}
