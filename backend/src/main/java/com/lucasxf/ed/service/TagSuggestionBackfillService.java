package com.lucasxf.ed.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.UserTagRepository;

import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.requireNonNull;

/**
 * Backfills AI tag suggestions for all active POKs belonging to users who have at least one tag.
 *
 * <p>Only users with active tag subscriptions are processed — users with no tags produce no
 * suggestions (the suggestion pipeline matches user's own tags against POK content). The operation
 * is idempotent: {@link TagSuggestionService#suggestTagsForPok} skips already-suggested tag names.
 *
 * <p>Intended as a one-time operational endpoint (via {@code POST /api/v1/admin/poks/backfill-tag-suggestions})
 * to retroactively generate suggestions for POKs that were created before the user had tags.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-28
 */
@Slf4j
@Service
public class TagSuggestionBackfillService {

    private static final int BATCH_SIZE = 20;
    private static final long BATCH_DELAY_MS = 50;

    private final UserTagRepository userTagRepository;
    private final PokRepository pokRepository;
    private final TagSuggestionService tagSuggestionService;

    public TagSuggestionBackfillService(UserTagRepository userTagRepository,
                                        PokRepository pokRepository,
                                        TagSuggestionService tagSuggestionService) {
        this.userTagRepository = requireNonNull(userTagRepository);
        this.pokRepository = requireNonNull(pokRepository);
        this.tagSuggestionService = requireNonNull(tagSuggestionService);
    }

    /**
     * Enqueues tag suggestion generation for all active POKs of users who have tags.
     *
     * @return the total number of POKs enqueued across all eligible users
     */
    public int backfill() {
        List<UUID> userIds = userTagRepository.findDistinctUserIdsWithActiveTags();
        log.info("Tag suggestion backfill: found {} users with active tags", userIds.size());

        int total = 0;

        for (UUID userId : userIds) {
            List<UUID> pokIds = pokRepository.findIdsByUserId(userId);
            total += pokIds.size();

            for (int i = 0; i < pokIds.size(); i += BATCH_SIZE) {
                List<UUID> batch = pokIds.subList(i, Math.min(i + BATCH_SIZE, pokIds.size()));
                for (UUID pokId : batch) {
                    tagSuggestionService.suggestTagsForPok(pokId, userId);
                }

                if (i + BATCH_SIZE < pokIds.size()) {
                    try {
                        Thread.sleep(BATCH_DELAY_MS);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        log.warn("Tag suggestion backfill interrupted for user {} after {}/{} POKs",
                            userId, i + batch.size(), pokIds.size());
                        return total - (pokIds.size() - i - batch.size());
                    }
                }
            }

            log.debug("Tag suggestion backfill: enqueued {} POKs for user {}", pokIds.size(), userId);
        }

        log.info("Tag suggestion backfill: enqueued {} POKs total across {} users", total, userIds.size());
        return total;
    }
}
