package com.lucasxf.ed.service;

import com.lucasxf.ed.config.SearchProperties;
import com.lucasxf.ed.exception.EmbeddingUnavailableException;
import com.lucasxf.ed.service.impl.HuggingFaceEmbeddingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.net.SocketTimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

/**
 * Unit tests for {@link HuggingFaceEmbeddingService}.
 *
 * <p>RestClient is mocked at the spec level: the request spec chain is stubbed
 * to return a controlled response body, allowing tests to cover retry logic,
 * circuit breaker behaviour, and JSON parsing without making real HTTP calls.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("HuggingFaceEmbeddingService")
class EmbeddingServiceTest {

    @Mock
    private RestClient.Builder restClientBuilder;

    @Mock
    private RestClient restClient;

    @Mock
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private RestClient.RequestBodySpec requestBodySpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    @Mock
    private SearchProperties searchProperties;

    @Mock
    private SearchProperties.HuggingFace huggingFaceProps;

    private HuggingFaceEmbeddingService service;

    @BeforeEach
    void setUp() {
        when(searchProperties.huggingFace()).thenReturn(huggingFaceProps);
        when(huggingFaceProps.apiKey()).thenReturn("hf-test-token");
        when(huggingFaceProps.modelUrl()).thenReturn("https://router.huggingface.co/test-model");
        when(huggingFaceProps.maxRetries()).thenReturn(3);

        when(restClientBuilder.build()).thenReturn(restClient);

        service = new HuggingFaceEmbeddingService(restClientBuilder, searchProperties);
    }

    private void stubSuccessfulEmbedding(float[] vector) {
        // HF returns float[][] — array of embeddings, one per input
        float[][] response = {vector};
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(float[][].class)).thenReturn(response);
    }

    @Test
    @DisplayName("returns 384-dimensional float[] on success")
    void embed_happyPath_returns384DimVector() {
        float[] expected = new float[384];
        for (int i = 0; i < 384; i++) expected[i] = i * 0.001f;
        stubSuccessfulEmbedding(expected);

        float[] result = service.embed("test input text");

        assertThat(result).hasSize(384);
        assertThat(result[0]).isEqualTo(expected[0]);
    }

    @Test
    @DisplayName("retries on 5xx and succeeds on third attempt")
    void embed_retriesOnServerError_succeedsEventually() {
        float[] expected = new float[384];
        expected[0] = 0.42f;

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(float[][].class))
            .thenThrow(new HttpServerErrorException(INTERNAL_SERVER_ERROR))
            .thenThrow(new HttpServerErrorException(INTERNAL_SERVER_ERROR))
            .thenReturn(new float[][]{expected});

        float[] result = service.embed("text");

        assertThat(result[0]).isEqualTo(0.42f);
        verify(responseSpec, times(3)).body(float[][].class);
    }

    @Test
    @DisplayName("throws EmbeddingUnavailableException after all retries exhausted on 5xx")
    void embed_allRetriesExhausted_throwsEmbeddingUnavailableException() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(float[][].class))
            .thenThrow(new HttpServerErrorException(INTERNAL_SERVER_ERROR));

        assertThatThrownBy(() -> service.embed("text"))
            .isInstanceOf(EmbeddingUnavailableException.class);

        verify(responseSpec, times(3)).body(float[][].class);
    }

    @Test
    @DisplayName("does NOT retry on 4xx client errors")
    void embed_clientError_throwsImmediatelyWithoutRetry() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(float[][].class))
            .thenThrow(new HttpClientErrorException(BAD_REQUEST));

        assertThatThrownBy(() -> service.embed("text"))
            .isInstanceOf(EmbeddingUnavailableException.class);

        // Only called once — no retries for 4xx
        verify(responseSpec, times(1)).body(float[][].class);
    }

    @Test
    @DisplayName("throws EmbeddingUnavailableException on network timeout")
    void embed_networkTimeout_throwsEmbeddingUnavailableException() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(float[][].class))
            .thenThrow(new ResourceAccessException("timeout", new SocketTimeoutException()));

        assertThatThrownBy(() -> service.embed("text"))
            .isInstanceOf(EmbeddingUnavailableException.class);
    }

    @Test
    @DisplayName("throws EmbeddingUnavailableException when response array is empty")
    void embed_emptyResponseArray_throwsEmbeddingUnavailableException() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(float[][].class)).thenReturn(new float[0][]);

        assertThatThrownBy(() -> service.embed("text"))
            .isInstanceOf(EmbeddingUnavailableException.class)
            .hasMessageContaining("empty");
    }
}
