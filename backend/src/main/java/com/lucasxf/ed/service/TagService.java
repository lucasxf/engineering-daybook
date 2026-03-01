package com.lucasxf.ed.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;

import com.lucasxf.ed.domain.PokTag;
import com.lucasxf.ed.domain.Tag;
import com.lucasxf.ed.domain.UserTag;
import com.lucasxf.ed.dto.CreateTagRequest;
import com.lucasxf.ed.dto.TagResponse;
import com.lucasxf.ed.dto.UpdateTagRequest;
import com.lucasxf.ed.exception.PokNotFoundException;
import com.lucasxf.ed.exception.TagConflictException;
import com.lucasxf.ed.exception.TagNotFoundException;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokTagRepository;
import com.lucasxf.ed.repository.TagRepository;
import com.lucasxf.ed.repository.UserTagRepository;

/**
 * Business logic for user tag subscriptions and POK–tag assignments.
 *
 * <p>Tags are stored in a global pool ({@link Tag}). Each user subscribes via
 * {@link UserTag} (with a personal color). Assignments between POKs and tags
 * are tracked in {@link PokTag} with a {@link PokTag.Source} discriminator.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
@Slf4j
@Service
@Transactional
public class TagService {

    private static final List<String> DEFAULT_COLORS = List.of(
            "blue", "green", "red", "purple", "yellow", "orange", "pink", "teal"
    );

    private final TagRepository tagRepository;
    private final UserTagRepository userTagRepository;
    private final PokTagRepository pokTagRepository;
    private final PokRepository pokRepository;
    private final Random random = new Random();

    public TagService(TagRepository tagRepository,
                      UserTagRepository userTagRepository,
                      PokTagRepository pokTagRepository,
                      PokRepository pokRepository) {
        this.tagRepository = tagRepository;
        this.userTagRepository = userTagRepository;
        this.pokTagRepository = pokTagRepository;
        this.pokRepository = pokRepository;
    }

    // ===== createOrReuse =====

    /**
     * Creates a tag subscription for the user, reusing a global tag if the name already
     * exists (case-insensitive). If the user already has an active subscription with the
     * same name, returns the existing subscription idempotently.
     *
     * @param request the create request containing the tag name
     * @param userId  the authenticated user's ID
     * @return the tag response (new or existing subscription)
     */
    public TagResponse createOrReuse(CreateTagRequest request, UUID userId) {
        String trimmedName = request.name().trim();

        if (userTagRepository.existsByUserIdAndTagNameIgnoreCaseAndDeletedAtIsNull(userId, trimmedName)) {
            UserTag existing = userTagRepository.findByUserIdAndDeletedAtIsNull(userId).stream()
                    .filter(ut -> ut.getTag().getName().equalsIgnoreCase(trimmedName))
                    .findFirst()
                    .orElseThrow();
            return TagResponse.from(existing);
        }

        Tag globalTag = tagRepository.findByNameIgnoreCase(trimmedName)
                .orElseGet(() -> tagRepository.save(new Tag(trimmedName)));

        String color = DEFAULT_COLORS.get(random.nextInt(DEFAULT_COLORS.size()));
        UserTag userTag = userTagRepository.save(new UserTag(userId, globalTag, color));
        return TagResponse.from(userTag);
    }

    // ===== getUserTags =====

    /**
     * Returns all active tag subscriptions for the given user.
     *
     * @param userId the user's ID
     * @return list of active tag responses
     */
    @Transactional(readOnly = true)
    public List<TagResponse> getUserTags(UUID userId) {
        return userTagRepository.findByUserIdAndDeletedAtIsNull(userId).stream()
                .map(TagResponse::from)
                .toList();
    }

    // ===== renameTag =====

    /**
     * Renames a user's tag subscription by soft-deleting the old one and creating a new
     * subscription pointing to the global tag for the new name.
     *
     * <p>PokTag assignments are migrated to the new global tag in bulk.
     *
     * @param userTagId the subscription ID to rename
     * @param request   the update request containing the new name
     * @param userId    the authenticated user's ID
     * @return the new tag response
     * @throws TagNotFoundException   if the subscription does not exist or belongs to another user
     * @throws TagConflictException   if the user already has an active subscription with the new name
     */
    public TagResponse renameTag(UUID userTagId, UpdateTagRequest request, UUID userId) {
        UserTag oldUserTag = findOwnedUserTag(userTagId, userId);

        String newName = request.name().trim();
        if (userTagRepository.existsByUserIdAndTagNameIgnoreCaseAndDeletedAtIsNull(userId, newName)) {
            throw new TagConflictException("Tag '" + newName + "' already exists");
        }

        // Soft-delete old subscription
        oldUserTag.softDelete();
        userTagRepository.save(oldUserTag);

        // Migrate pok_tags: bulk-reassign from old tag to new global tag
        Tag newGlobalTag = tagRepository.findByNameIgnoreCase(newName)
                .orElseGet(() -> tagRepository.save(new Tag(newName)));

        List<UUID> userPokIds = pokRepository.findIdsByUserId(userId);
        if (!userPokIds.isEmpty()) {
            pokTagRepository.reassignTag(oldUserTag.getTag().getId(), newGlobalTag.getId(), userPokIds);
        }

        // Create new subscription, preserve old color
        UserTag newUserTag = userTagRepository.save(new UserTag(userId, newGlobalTag, oldUserTag.getColor()));
        return TagResponse.from(newUserTag);
    }

    // ===== deleteTag =====

    /**
     * Soft-deletes a user's tag subscription and removes all POK–tag assignments for
     * that tag across the user's POKs.
     *
     * @param userTagId the subscription ID to delete
     * @param userId    the authenticated user's ID
     * @throws TagNotFoundException if the subscription does not exist or belongs to another user
     */
    public void deleteTag(UUID userTagId, UUID userId) {
        UserTag userTag = findOwnedUserTag(userTagId, userId);

        List<UUID> userPokIds = pokRepository.findIdsByUserId(userId);
        if (!userPokIds.isEmpty()) {
            pokTagRepository.deleteByTagIdAndPokIdIn(userTag.getTag().getId(), userPokIds);
        }

        userTag.softDelete();
        userTagRepository.save(userTag);
    }

    // ===== assignTag =====

    /**
     * Assigns a tag to a POK with {@link PokTag.Source#MANUAL} source.
     * Idempotent: if the assignment already exists, does nothing.
     *
     * @param pokId     the POK to tag
     * @param userTagId the user's tag subscription ID
     * @param userId    the authenticated user's ID
     * @throws TagNotFoundException if the subscription does not exist or belongs to another user
     */
    public void assignTag(UUID pokId, UUID userTagId, UUID userId) {
        UserTag userTag = findOwnedUserTag(userTagId, userId);
        findOwnedPok(pokId, userId);

        pokTagRepository.findByPokIdAndTagId(pokId, userTag.getTag().getId())
                .ifPresentOrElse(
                        existing -> { /* idempotent — do nothing */ },
                        () -> pokTagRepository.save(new PokTag(pokId, userTag.getTag().getId(), PokTag.Source.MANUAL))
                );
    }

    // ===== removeTag =====

    /**
     * Removes a tag assignment from a POK. Does nothing gracefully if the assignment
     * does not exist.
     *
     * @param pokId     the POK to untag
     * @param userTagId the user's tag subscription ID
     * @param userId    the authenticated user's ID
     * @throws TagNotFoundException if the subscription does not exist or belongs to another user
     */
    public void removeTag(UUID pokId, UUID userTagId, UUID userId) {
        UserTag userTag = findOwnedUserTag(userTagId, userId);
        findOwnedPok(pokId, userId);

        pokTagRepository.findByPokIdAndTagId(pokId, userTag.getTag().getId())
                .ifPresent(pokTagRepository::delete);
    }

    // ===== assignTagsToNewPok =====

    /**
     * Assigns multiple tags to a newly created POK atomically, skipping the POK ownership
     * check (the caller guarantees the POK was just created by the same user in the same
     * transaction). Invalid or non-owned {@code userTagIds} are silently ignored.
     *
     * @param pokId      the newly created POK's ID
     * @param userTagIds the user-tag subscription IDs to assign (may be null or empty)
     * @param userId     the authenticated user's ID
     */
    void assignTagsToNewPok(UUID pokId, List<UUID> userTagIds, UUID userId) {
        if (userTagIds == null || userTagIds.isEmpty()) {
            return;
        }

        Set<UUID> seen = new HashSet<>();
        List<PokTag> toSave = new ArrayList<>();
        for (UUID userTagId : userTagIds) {
            try {
                UserTag userTag = findOwnedUserTag(userTagId, userId);
                UUID globalTagId = userTag.getTag().getId();
                if (seen.add(globalTagId)) {
                    toSave.add(new PokTag(pokId, globalTagId, PokTag.Source.MANUAL));
                }
            } catch (TagNotFoundException e) {
                log.debug("Ignoring invalid/non-owned userTagId {} during POK creation", userTagId);
            }
        }

        if (!toSave.isEmpty()) {
            pokTagRepository.saveAll(toSave);
        }
    }

    // ===== helpers =====

    private UserTag findOwnedUserTag(UUID userTagId, UUID userId) {
        UserTag userTag = userTagRepository.findById(userTagId)
                .orElseThrow(() -> new TagNotFoundException("Tag not found: " + userTagId));
        if (!userTag.getUserId().equals(userId)) {
            throw new TagNotFoundException("Tag not found: " + userTagId); // 403 masked as 404
        }
        if (!userTag.isActive()) {
            throw new TagNotFoundException("Tag not found: " + userTagId); // soft-deleted
        }
        return userTag;
    }

    private void findOwnedPok(UUID pokId, UUID userId) {
        pokRepository.findByIdAndDeletedAtIsNull(pokId)
                .filter(p -> p.getUserId().equals(userId))
                .orElseThrow(() -> new PokNotFoundException("POK not found: " + pokId));
    }
}
