package com.lucasxf.ed.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.dto.CreatePokRequest;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.dto.UpdatePokRequest;
import com.lucasxf.ed.exception.PokAccessDeniedException;
import com.lucasxf.ed.exception.PokNotFoundException;
import com.lucasxf.ed.repository.PokRepository;
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

    public PokService(PokRepository pokRepository) {
        this.pokRepository = requireNonNull(pokRepository);
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

        return PokResponse.from(pok);
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

        return poks.map(PokResponse::from);
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

        pok.updateTitle(request.title());
        pok.updateContent(request.content());

        Pok updatedPok = pokRepository.save(pok);

        log.info("POK updated: id={}, userId={}", id, userId);

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

        pok.softDelete();
        pokRepository.save(pok);

        log.info("POK soft deleted: id={}, userId={}", id, userId);
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
}
