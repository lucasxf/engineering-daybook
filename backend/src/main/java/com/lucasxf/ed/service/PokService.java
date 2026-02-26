package com.lucasxf.ed.service;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.PokAuditLog;
import com.lucasxf.ed.domain.PokAuditLog.Action;
import com.lucasxf.ed.domain.PokTag;
import com.lucasxf.ed.domain.UserTag;
import com.lucasxf.ed.dto.CreatePokRequest;
import com.lucasxf.ed.dto.PokAuditLogResponse;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.dto.TagResponse;
import com.lucasxf.ed.dto.TagSuggestionResponse;
import com.lucasxf.ed.dto.UpdatePokRequest;
import com.lucasxf.ed.exception.EmbeddingUnavailableException;
import com.lucasxf.ed.exception.PokAccessDeniedException;
import com.lucasxf.ed.exception.PokNotFoundException;
import com.lucasxf.ed.repository.PokAuditLogRepository;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokTagRepository;
import com.lucasxf.ed.repository.PokTagSuggestionRepository;
import com.lucasxf.ed.repository.UserTagRepository;
import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.requireNonNull;

/**
 * Service for POK (Piece of Knowledge) operations.
 *
 * <p>Handles business logic for CRUD operations on POKs, including:
 * <ul>
 *   <li>Authorization (users can only access their own POKs)</li>
 *   <li>Soft delete (POKs are marked as deleted, not permanently removed)</li>
 *   <li>Validation (title optional, content mandatory)</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
@Slf4j
@Service
public class PokService {

    private final PokRepository pokRepository;
    private final PokAuditLogRepository pokAuditLogRepository;
    private final PokTagRepository pokTagRepository;
    private final UserTagRepository userTagRepository;
    private final PokTagSuggestionRepository pokTagSuggestionRepository;
    private final TagSuggestionService tagSuggestionService;
    private final EmbeddingGenerationService embeddingGenerationService;
    private final EmbeddingService embeddingService;

    public PokService(PokRepository pokRepository,
                      PokAuditLogRepository pokAuditLogRepository,
                      PokTagRepository pokTagRepository,
                      UserTagRepository userTagRepository,
                      PokTagSuggestionRepository pokTagSuggestionRepository,
                      @Lazy TagSuggestionService tagSuggestionService,
                      EmbeddingGenerationService embeddingGenerationService,
                      EmbeddingService embeddingService) {
        this.pokRepository = requireNonNull(pokRepository);
        this.pokAuditLogRepository = requireNonNull(pokAuditLogRepository);
        this.pokTagRepository = requireNonNull(pokTagRepository);
        this.userTagRepository = requireNonNull(userTagRepository);
        this.pokTagSuggestionRepository = requireNonNull(pokTagSuggestionRepository);
        this.tagSuggestionService = requireNonNull(tagSuggestionService);
        this.embeddingGenerationService = requireNonNull(embeddingGenerationService);
        this.embeddingService = requireNonNull(embeddingService);
    }

    /**
     * Creates a new POK.
     *
     * @param request the POK creation request (title optional, content mandatory)
     * @param userId  the ID of the user creating the POK
     * @return the created POK
     */
    @Transactional
    public PokResponse create(CreatePokRequest request, UUID userId) {
        log.debug("Creating POK for user {} with title: {}", userId, request.title());

        Pok pok = new Pok(userId, request.title(), request.content());
        Pok savedPok = pokRepository.save(pok);

        log.info("POK created: id={}, userId={}, hasTitle={}",
            savedPok.getId(), userId, request.title() != null && !request.title().isEmpty());

        logCreate(savedPok, userId);

        // Trigger async AI tag suggestions (non-blocking)
        tagSuggestionService.suggestTagsForPok(savedPok.getId(), userId);

        // Trigger async vector embedding generation (non-blocking)
        embeddingGenerationService.generateEmbeddingForPok(savedPok.getId());

        return PokResponse.from(savedPok);
    }

    /**
     * Retrieves a POK by ID.
     *
     * @param id     the POK ID
     * @param userId the ID of the user requesting the POK
     * @return the POK
     * @throws PokNotFoundException       if the POK is not found or soft-deleted
     * @throws PokAccessDeniedException   if the POK belongs to another user
     */
    @Transactional(readOnly = true)
    public PokResponse getById(UUID id, UUID userId) {
        log.debug("Getting POK {} for user {}", id, userId);

        Pok pok = pokRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new PokNotFoundException("POK not found"));

        verifyOwnership(pok, userId);

        List<TagResponse> tags = buildTagResponses(pok.getId(), userId);
        List<TagSuggestionResponse> suggestions = buildSuggestionResponses(pok.getId());

        return PokResponse.from(pok, tags, suggestions);
    }

    /**
     * Retrieves all active (non-deleted) POKs for a user with pagination.
     *
     * @param userId   the user ID
     * @param pageable pagination and sorting parameters
     * @return a page of POKs
     */
    @Transactional(readOnly = true)
    public Page<PokResponse> getAll(UUID userId, Pageable pageable) {
        log.debug("Listing POKs for user {} (page={}, size={})",
            userId, pageable.getPageNumber(), pageable.getPageSize());

        Page<Pok> poks = pokRepository.findByUserIdAndDeletedAtIsNull(userId, pageable);

        log.debug("Found {} POKs for user {}", poks.getTotalElements(), userId);

        List<UserTag> userTags = userTagRepository.findByUserIdAndDeletedAtIsNull(userId);
        return poks.map(pok -> PokResponse.from(pok, buildTagResponses(pok.getId(), userTags), List.of()));
    }

    /**
     * Searches POKs with optional keyword, search mode, date filters, and dynamic sorting.
     *
     * <p>All search parameters are optional:
     * <ul>
     *   <li>keyword: case-insensitive search in title and content</li>
     *   <li>searchMode: "semantic" (vector-only), "hybrid" (semantic + keyword union), or null (keyword-only)</li>
     *   <li>sortBy: field to sort by (createdAt or updatedAt, default: updatedAt)</li>
     *   <li>sortDirection: ASC or DESC (default: DESC)</li>
     *   <li>createdFrom/To: filter by creation date range</li>
     *   <li>updatedFrom/To: filter by update date range</li>
     * </ul>
     *
     * <p>Semantic and hybrid modes fall back to keyword-only search if the embedding service is
     * unavailable.
     *
     * @param userId        the user ID
     * @param keyword       optional keyword to search (null = no keyword filter)
     * @param searchMode    optional search mode ("semantic", "hybrid", or null for keyword-only)
     * @param sortBy        optional sort field (null = default to updatedAt)
     * @param sortDirection optional sort direction (null = default to DESC)
     * @param createdFrom   optional minimum creation date (ISO 8601 string)
     * @param createdTo     optional maximum creation date (ISO 8601 string)
     * @param updatedFrom   optional minimum update date (ISO 8601 string)
     * @param updatedTo     optional maximum update date (ISO 8601 string)
     * @param page          page number (0-indexed)
     * @param size          page size
     * @return a page of matching POKs
     */
    @Transactional(readOnly = true)
    public Page<PokResponse> search(
        UUID userId,
        String keyword,
        String searchMode,
        String sortBy,
        String sortDirection,
        String createdFrom,
        String createdTo,
        String updatedFrom,
        String updatedTo,
        int page,
        int size
    ) {
        log.debug("Searching POKs for user {} with keyword='{}', searchMode={}, page={}, size={}",
            userId, keyword, searchMode, page, size);

        List<UserTag> userTags = userTagRepository.findByUserIdAndDeletedAtIsNull(userId);

        boolean hasKeyword = keyword != null && !keyword.isBlank();
        if (hasKeyword && ("semantic".equals(searchMode) || "hybrid".equals(searchMode))) {
            try {
                return searchWithSemantics(userId, keyword, searchMode, page, size, userTags);
            } catch (EmbeddingUnavailableException e) {
                log.warn("Embedding unavailable for search query — falling back to keyword search: {}", e.getMessage());
                // fall through to keyword search below
            }
        }

        return keywordSearch(userId, keyword, sortBy, sortDirection, createdFrom, createdTo,
            updatedFrom, updatedTo, page, size, userTags);
    }

    /**
     * Performs semantic or hybrid search using the pgvector {@code <=>} cosine distance operator.
     */
    private Page<PokResponse> searchWithSemantics(
        UUID userId, String keyword, String searchMode,
        int page, int size, List<UserTag> userTags
    ) {
        String text = (keyword != null && !keyword.isBlank()) ? keyword : "";
        float[] queryEmbedding = embeddingService.embed(text);
        String queryVector = toVectorString(queryEmbedding);

        int semanticLimit = size * 3;  // Over-fetch for hybrid recall
        int semanticOffset = page * size;
        List<Pok> semanticPoks = pokRepository.findSemantically(userId, queryVector, semanticLimit, semanticOffset);

        if ("hybrid".equals(searchMode) && keyword != null && !keyword.isBlank()) {
            // Merge semantic + keyword results, deduplicated (semantic first)
            Pageable pageable = PageRequest.of(page, size, buildSort(null, null));
            Page<Pok> keywordPage = pokRepository.searchPoks(userId, keyword,
                null, null, null, null, pageable);
            List<Pok> merged = mergeSemanticsAndKeyword(semanticPoks, keywordPage.getContent(), size);
            return new PageImpl<>(
                merged.stream()
                    .map(pok -> PokResponse.from(pok, buildTagResponses(pok.getId(), userTags), List.of()))
                    .toList(),
                PageRequest.of(page, size),
                keywordPage.getTotalElements()
            );
        }

        // Pure semantic — paginate from the fetched list
        // Approximate total: offset + fetched count. If semanticPoks is full (size*3), there may be
        // more pages; if under-full, this is the actual count of all matching results.
        long approximateTotal = (long) semanticOffset + semanticPoks.size();
        List<Pok> pagePoks = semanticPoks.stream().limit(size).toList();
        return new PageImpl<>(
            pagePoks.stream()
                .map(pok -> PokResponse.from(pok, buildTagResponses(pok.getId(), userTags), List.of()))
                .toList(),
            PageRequest.of(page, size),
            approximateTotal
        );
    }

    /**
     * Merges semantic and keyword result lists, deduplicating by POK ID.
     * Semantic results take priority; keyword-only results are appended.
     */
    private List<Pok> mergeSemanticsAndKeyword(List<Pok> semantic, List<Pok> keyword, int size) {
        Map<UUID, Pok> merged = new LinkedHashMap<>();
        semantic.forEach(p -> merged.put(p.getId(), p));
        keyword.forEach(p -> merged.putIfAbsent(p.getId(), p));
        return merged.values().stream().limit(size).toList();
    }

    /**
     * Performs keyword-only search (existing behaviour, used as fallback for semantic modes).
     */
    private Page<PokResponse> keywordSearch(
        UUID userId, String keyword,
        String sortBy, String sortDirection,
        String createdFrom, String createdTo,
        String updatedFrom, String updatedTo,
        int page, int size, List<UserTag> userTags
    ) {
        Instant createdFromInstant = parseInstant(createdFrom);
        Instant createdToInstant = parseInstant(createdTo);
        Instant updatedFromInstant = parseInstant(updatedFrom);
        Instant updatedToInstant = parseInstant(updatedTo);
        Sort sort = buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Pok> poks = pokRepository.searchPoks(userId, keyword,
            createdFromInstant, createdToInstant,
            updatedFromInstant, updatedToInstant, pageable);

        log.debug("Found {} POKs matching search criteria for user {}", poks.getTotalElements(), userId);
        return poks.map(pok -> PokResponse.from(pok, buildTagResponses(pok.getId(), userTags), List.of()));
    }

    /**
     * Converts a float[] embedding to pgvector text format {@code "[f1,f2,...,fn]"}.
     */
    static String toVectorString(float[] embedding) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(embedding[i]);
        }
        sb.append(']');
        return sb.toString();
    }

    /**
     * Parses an ISO 8601 date string to Instant.
     *
     * @param dateString the date string (ISO 8601 format)
     * @return the parsed Instant, or null if the string is null/empty
     * @throws IllegalArgumentException if the string is not a valid ISO 8601 instant
     */
    private Instant parseInstant(String dateString) {
        if (dateString == null || dateString.isEmpty()) {
            return null;
        }
        try {
            return Instant.parse(dateString);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format: '" + dateString + "'. Expected ISO 8601 (e.g. 2026-01-01T00:00:00Z)");
        }
    }

    private static final java.util.Set<String> ALLOWED_SORT_FIELDS =
        java.util.Set.of("createdAt", "updatedAt");

    /**
     * Builds a Sort object from sortBy and sortDirection parameters.
     *
     * @param sortBy        the field to sort by (createdAt or updatedAt, default: updatedAt)
     * @param sortDirection the sort direction (ASC or DESC, default: DESC)
     * @return the Sort object
     * @throws IllegalArgumentException if sortBy is not a whitelisted field
     */
    private Sort buildSort(String sortBy, String sortDirection) {
        String field = (sortBy != null && !sortBy.isEmpty()) ? sortBy : "updatedAt";
        if (!ALLOWED_SORT_FIELDS.contains(field)) {
            throw new IllegalArgumentException(
                "Invalid sort field: '" + field + "'. Allowed values: " + ALLOWED_SORT_FIELDS);
        }
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection)
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;

        return Sort.by(direction, field);
    }

    /**
     * Updates a POK.
     *
     * @param id      the POK ID
     * @param request the update request (title optional, content mandatory)
     * @param userId  the ID of the user updating the POK
     * @return the updated POK
     * @throws PokNotFoundException       if the POK is not found or soft-deleted
     * @throws PokAccessDeniedException   if the POK belongs to another user
     */
    @Transactional
    public PokResponse update(UUID id, UpdatePokRequest request, UUID userId) {
        log.debug("Updating POK {} for user {}", id, userId);

        Pok pok = pokRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new PokNotFoundException("POK not found"));

        verifyOwnership(pok, userId);

        String oldTitle = pok.getTitle();
        String oldContent = pok.getContent();

        pok.updateTitle(request.title());
        pok.updateContent(request.content());
        pok.clearEmbedding();  // Mark stale; will be regenerated async below

        Pok updatedPok = pokRepository.save(pok);

        log.info("POK updated: id={}, userId={}", id, userId);

        logUpdate(updatedPok, userId, oldTitle, oldContent);

        // Trigger async vector embedding regeneration (non-blocking)
        embeddingGenerationService.generateEmbeddingForPok(id);

        return PokResponse.from(updatedPok);
    }

    /**
     * Soft deletes a POK by setting its deletion timestamp.
     *
     * <p>The POK remains in the database but is excluded from queries.
     * Restore functionality will be added in Phase 2.
     *
     * @param id     the POK ID
     * @param userId the ID of the user deleting the POK
     * @throws PokNotFoundException       if the POK is not found or already soft-deleted
     * @throws PokAccessDeniedException   if the POK belongs to another user
     */
    @Transactional
    public void softDelete(UUID id, UUID userId) {
        log.debug("Soft deleting POK {} for user {}", id, userId);

        Pok pok = pokRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new PokNotFoundException("POK not found"));

        verifyOwnership(pok, userId);

        String oldTitle = pok.getTitle();
        String oldContent = pok.getContent();

        pok.softDelete();
        pokRepository.save(pok);

        log.info("POK soft deleted: id={}, userId={}", id, userId);

        logDelete(pok, userId, oldTitle, oldContent);
    }

    /**
     * Verifies that the POK belongs to the user.
     *
     * @param pok    the POK to verify
     * @param userId the user ID
     * @throws PokAccessDeniedException if the POK belongs to another user
     */
    private void verifyOwnership(Pok pok, UUID userId) {
        if (!pok.getUserId().equals(userId)) {
            log.warn("Access denied: user {} attempted to access POK {} owned by {}",
                userId, pok.getId(), pok.getUserId());
            throw new PokAccessDeniedException("You do not have permission to access this POK");
        }
    }

    /**
     * Retrieves the audit history for a POK, most recent first.
     *
     * @param id     the POK ID
     * @param userId the requesting user's ID
     * @return list of audit log entries, newest first
     * @throws PokNotFoundException     if the POK is not found
     * @throws PokAccessDeniedException if the POK belongs to another user
     */
    @Transactional(readOnly = true)
    public List<PokAuditLogResponse> getHistory(UUID id, UUID userId) {
        log.debug("Getting history for POK {} for user {}", id, userId);

        // Verify the POK exists and the user owns it — we check including deleted POKs
        // because history should still be accessible for deleted POKs.
        Pok pok = pokRepository.findById(id)
            .orElseThrow(() -> new PokNotFoundException("POK not found"));

        verifyOwnership(pok, userId);

        return pokAuditLogRepository.findByPokIdOrderByOccurredAtDesc(id)
            .stream()
            .map(PokAuditLogResponse::from)
            .toList();
    }

    /**
     * Builds the tag response list for a single POK, fetching the user's tags from the database.
     * Use the overload that accepts a pre-fetched {@code userTags} list when processing multiple
     * POKs in bulk to avoid N+1 queries.
     *
     * @param pokId  the POK's ID
     * @param userId the owner's user ID (used to look up tags)
     * @return list of {@link TagResponse} for the POK's assigned tags
     */
    private List<TagResponse> buildTagResponses(UUID pokId, UUID userId) {
        List<UserTag> userTags = userTagRepository.findByUserIdAndDeletedAtIsNull(userId);
        return buildTagResponses(pokId, userTags);
    }

    /**
     * Builds the tag response list for a single POK from a pre-fetched list of the user's tags.
     * Callers that process multiple POKs should fetch {@code userTags} once and pass it here
     * to avoid issuing one query per POK (N+1 problem).
     *
     * @param pokId     the POK's ID
     * @param userTags  the caller-supplied list of the user's active tags
     * @return list of {@link TagResponse} for the POK's assigned tags
     */
    private List<TagResponse> buildTagResponses(UUID pokId, List<UserTag> userTags) {
        return pokTagRepository.findByPokId(pokId).stream()
                .map(PokTag::getTagId)
                .flatMap(tagId -> userTags.stream()
                        .filter(ut -> ut.getTag().getId() != null && ut.getTag().getId().equals(tagId)))
                .map(TagResponse::from)
                .toList();
    }

    private List<TagSuggestionResponse> buildSuggestionResponses(UUID pokId) {
        return pokTagSuggestionRepository
                .findByPokIdAndStatus(pokId, com.lucasxf.ed.domain.PokTagSuggestion.Status.PENDING)
                .stream()
                .map(TagSuggestionResponse::from)
                .toList();
    }

    private void logCreate(Pok pok, UUID userId) {
        PokAuditLog entry = new PokAuditLog(
            pok.getId(), userId, Action.CREATE,
            null, pok.getTitle(),
            null, pok.getContent(),
            pok.getCreatedAt()
        );
        pokAuditLogRepository.save(entry);
    }

    private void logUpdate(Pok pok, UUID userId, String oldTitle, String oldContent) {
        PokAuditLog entry = new PokAuditLog(
            pok.getId(), userId, Action.UPDATE,
            oldTitle, pok.getTitle(),
            oldContent, pok.getContent(),
            Instant.now()
        );
        pokAuditLogRepository.save(entry);
    }

    private void logDelete(Pok pok, UUID userId, String oldTitle, String oldContent) {
        PokAuditLog entry = new PokAuditLog(
            pok.getId(), userId, Action.DELETE,
            oldTitle, null,
            oldContent, null,
            pok.getDeletedAt()
        );
        pokAuditLogRepository.save(entry);
    }
}
