package com.lucasxf.ed.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.PokShare;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.dto.PokShareResponse;
import com.lucasxf.ed.exception.PokNotFoundException;
import com.lucasxf.ed.exception.PokShareAccessDeniedException;
import com.lucasxf.ed.exception.PokShareConflictException;
import com.lucasxf.ed.exception.PokShareNotFoundException;
import com.lucasxf.ed.exception.SelfShareException;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokShareRepository;
import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.requireNonNull;

/**
 * Service for re-learning (PokShare) operations.
 *
 * <p>A re-learning is a reference — never a copy — of another learner's PUBLIC learning.
 * The original content is SACRED and is never modified. Attribution is always visible.
 *
 * <p>Enforced invariants:
 * <ul>
 *   <li>Cannot re-learn own POK (self-share rejected with 400)</li>
 *   <li>Original must be PUBLIC for MVP (400 if not)</li>
 *   <li>Visibility tier of the re-learning cannot be looser than the original's (400)</li>
 *   <li>One re-learning per learner per original POK (409 on duplicate)</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
@Slf4j
@Service
public class PokShareService {

    private final PokShareRepository pokShareRepository;
    private final PokRepository pokRepository;
    private final UserService userService;
    private final FollowService followService;

    public PokShareService(PokShareRepository pokShareRepository,
                           PokRepository pokRepository,
                           UserService userService,
                           FollowService followService) {
        this.pokShareRepository = requireNonNull(pokShareRepository);
        this.pokRepository = requireNonNull(pokRepository);
        this.userService = requireNonNull(userService);
        this.followService = requireNonNull(followService);
    }

    /**
     * Re-learns (shares) a PUBLIC learning.
     *
     * @param originalPokId  the ID of the original POK to re-learn
     * @param sharedByUserId the ID of the learner performing the re-learning
     * @param note           optional personal note (max 500 chars, nullable)
     * @param visibility     visibility tier for this re-learning; null defaults to the original's tier
     * @return the created share response
     * @throws PokNotFoundException        if the original POK is not found or soft-deleted
     * @throws SelfShareException          if the learner tries to re-learn their own POK
     * @throws IllegalArgumentException    if the original is not PUBLIC or visibility tier is too loose
     * @throws PokShareConflictException   if the learner has already re-learned this POK
     */
    @Transactional
    public PokShareResponse share(UUID originalPokId, UUID sharedByUserId, String note, Pok.Visibility visibility) {
        Pok original = pokRepository.findByIdAndDeletedAtIsNull(originalPokId)
            .orElseThrow(() -> new PokNotFoundException("Learning not found"));

        // FR8: cannot re-learn own POK
        if (original.getUserId().equals(sharedByUserId)) {
            throw new SelfShareException("You cannot re-learn your own learning");
        }

        // FR1 MVP scope: only PUBLIC originals can be re-learned
        if (original.getVisibility() != Pok.Visibility.PUBLIC) {
            throw new IllegalArgumentException(
                "Only PUBLIC learnings can be re-learned (MVP scope)");
        }

        // FR4: visibility tier cannot be looser than original's
        Pok.Visibility effectiveVisibility = visibility != null ? visibility : original.getVisibility();
        if (effectiveVisibility.ordinal() > original.getVisibility().ordinal()) {
            throw new IllegalArgumentException(
                "Re-learning visibility (" + effectiveVisibility + ") cannot be looser " +
                "than the original's visibility (" + original.getVisibility() + ")");
        }

        // FR7: duplicate check
        if (pokShareRepository.existsByOriginalPokIdAndSharedByUserId(originalPokId, sharedByUserId)) {
            throw new PokShareConflictException("You have already re-learned this learning");
        }

        PokShare share = new PokShare(originalPokId, sharedByUserId, note, effectiveVisibility);
        PokShare saved = pokShareRepository.save(share);

        log.info("Re-learning created: shareId={}, originalPokId={}, sharedBy={}",
            saved.getId(), originalPokId, sharedByUserId);

        User sharer = userService.findById(sharedByUserId);
        PokResponse originalPokResponse = PokResponse.from(original);
        return PokShareResponse.from(saved, originalPokResponse, sharer.getHandle());
    }

    /**
     * Removes a re-learning. Only the sharer can remove their own re-learning.
     *
     * @param shareId     the re-learning ID to remove
     * @param requesterId the ID of the requesting user
     * @throws PokShareNotFoundException     if the share does not exist
     * @throws PokShareAccessDeniedException if the requester is not the sharer
     */
    @Transactional
    public void unshare(UUID shareId, UUID requesterId) {
        PokShare share = pokShareRepository.findById(shareId)
            .orElseThrow(() -> new PokShareNotFoundException("Re-learning not found"));

        if (!share.getSharedByUserId().equals(requesterId)) {
            throw new PokShareAccessDeniedException("You can only remove your own re-learnings");
        }

        pokShareRepository.delete(share);
        log.info("Re-learning removed: shareId={}, requesterId={}", shareId, requesterId);
    }

    /**
     * Deletes all shares referencing the given original POK.
     *
     * <p>Called within the same {@code @Transactional} boundary as:
     * <ul>
     *   <li>{@code PokService.softDelete()} — when the original is soft-deleted</li>
     *   <li>{@code PokService.update()} — if visibility ever narrows to PRIVATE (forward-compat guard)</li>
     * </ul>
     *
     * @param originalPokId the original POK's ID
     */
    @Transactional
    public void cascadeDeleteByOriginalPok(UUID originalPokId) {
        pokShareRepository.deleteByOriginalPokId(originalPokId);
        log.info("Cascade-deleted all shares for originalPokId={}", originalPokId);
    }

    /**
     * Returns the share detail for the given share ID, applying visibility-based access control.
     *
     * <p>Access is governed by {@code PokShare.visibility} and the viewer's relationship with
     * the <strong>sharer</strong> — not the original author.
     *
     * @param shareId     the share ID to retrieve
     * @param requesterId the ID of the requesting user
     * @return the share response
     * @throws PokShareNotFoundException     if the share does not exist
     * @throws PokShareAccessDeniedException if the requester does not have access
     */
    @Transactional(readOnly = true)
    public PokShareResponse getShareById(UUID shareId, UUID requesterId) {
        PokShare share = pokShareRepository.findById(shareId)
            .orElseThrow(() -> new PokShareNotFoundException("Re-learning not found"));

        verifyShareAccess(share, requesterId);

        Pok original = pokRepository.findByIdAndDeletedAtIsNull(share.getOriginalPokId())
            .orElseThrow(() -> new PokNotFoundException("Original learning not found"));

        User sharer = userService.findById(share.getSharedByUserId());
        PokResponse originalPokResponse = PokResponse.from(original);
        return PokShareResponse.from(share, originalPokResponse, sharer.getHandle());
    }

    /**
     * Verifies that the requester has access to a given share based on its visibility tier
     * and the requester's relationship with the sharer.
     *
     * @param share       the share to check
     * @param requesterId the requesting user's ID
     * @throws PokShareAccessDeniedException if access is denied
     */
    private void verifyShareAccess(PokShare share, UUID requesterId) {
        // Sharer always has access
        if (share.getSharedByUserId().equals(requesterId)) return;

        UUID sharerId = share.getSharedByUserId();
        switch (share.getVisibility()) {
            case PUBLIC -> { /* any authenticated user */ }
            case FOLLOWERS_ONLY -> {
                if (!followService.isFollowing(requesterId, sharerId)) {
                    throw new PokShareAccessDeniedException("You do not have access to this re-learning");
                }
            }
            case COLLEAGUES_ONLY -> {
                if (!followService.areColleagues(requesterId, sharerId)) {
                    throw new PokShareAccessDeniedException("You do not have access to this re-learning");
                }
            }
            case PRIVATE -> throw new PokShareAccessDeniedException("You do not have access to this re-learning");
        }
    }
}
