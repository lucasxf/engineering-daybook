package com.lucasxf.ed.service;

import com.lucasxf.ed.config.SearchProperties;
import com.lucasxf.ed.exception.EmbeddingUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * {@link EmbeddingService} backed by the HuggingFace Inference API.
 *
 * <p>Uses {@code paraphrase-multilingual-MiniLM-L12-v2} (384 dimensions) via
 * {@code https://router.huggingface.co/}. Retries on 5xx and network errors up to
 * {@code search.hugging-face.max-retries} times. Does NOT retry on 4xx (client errors).
 * Throws {@link EmbeddingUnavailableException} when all retries are exhausted or on
 * non-retryable errors.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@Slf4j
@Service
public class HuggingFaceEmbeddingService implements EmbeddingService {

    private final RestClient restClient;
    private final SearchProperties.HuggingFace props;

    public HuggingFaceEmbeddingService(RestClient.Builder restClientBuilder,
                                       SearchProperties searchProperties) {
        this.restClient = restClientBuilder.build();
        this.props = searchProperties.huggingFace();
    }

    /**
     * {@inheritDoc}
     *
     * <p>Sends a POST to the HuggingFace Inference API. The API returns a
     * {@code float[][]} (one embedding per input). Only the first element is used.
     *
     * @throws EmbeddingUnavailableException if all retries are exhausted or a
     *         non-retryable error (4xx, empty response) occurs
     */
    @Override
    public float[] embed(String text) {
        int maxRetries = props.maxRetries();
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                float[][] response = restClient.post()
                    .uri(props.modelUrl())
                    .header("Authorization", "Bearer " + props.apiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("inputs", text))
                    .retrieve()
                    .body(float[][].class);

                if (response == null || response.length == 0) {
                    throw new EmbeddingUnavailableException(
                        "HuggingFace returned an empty embedding response");
                }

                return response[0];

            } catch (HttpClientErrorException e) {
                // 4xx: client error — do not retry, fail immediately
                log.warn("HuggingFace embedding failed with client error {}: {}",
                    e.getStatusCode(), e.getMessage());
                throw new EmbeddingUnavailableException(
                    "Embedding failed with client error: " + e.getStatusCode(), e);

            } catch (EmbeddingUnavailableException e) {
                // Empty response — no retries
                throw e;

            } catch (Exception e) {
                // 5xx / network errors — retryable
                lastException = e;
                log.warn("HuggingFace embedding attempt {}/{} failed: {}",
                    attempt, maxRetries, e.getMessage());
            }
        }

        throw new EmbeddingUnavailableException(
            "HuggingFace embedding unavailable after " + maxRetries + " retries", lastException);
    }
}
