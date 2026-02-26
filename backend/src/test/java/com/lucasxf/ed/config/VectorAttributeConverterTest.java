package com.lucasxf.ed.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link VectorAttributeConverter}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@DisplayName("VectorAttributeConverter")
class VectorAttributeConverterTest {

    private final VectorAttributeConverter converter = new VectorAttributeConverter();

    @Test
    @DisplayName("converts float[] to pgvector text format")
    void convertToDatabaseColumn_convertsFloatArrayToString() {
        float[] vector = {0.1f, -0.5f, 1.0f};

        String result = converter.convertToDatabaseColumn(vector);

        assertThat(result).isEqualTo("[0.1,-0.5,1.0]");
    }

    @Test
    @DisplayName("converts pgvector text format back to float[]")
    void convertToEntityAttribute_convertsStringToFloatArray() {
        String dbData = "[0.1,-0.5,1.0]";

        float[] result = converter.convertToEntityAttribute(dbData);

        assertThat(result).hasSize(3);
        assertThat(result[0]).isEqualTo(0.1f);
        assertThat(result[1]).isEqualTo(-0.5f);
        assertThat(result[2]).isEqualTo(1.0f);
    }

    @Test
    @DisplayName("round-trip: float[] → String → float[] preserves values")
    void roundTrip_preservesValues() {
        float[] original = new float[384];
        for (int i = 0; i < 384; i++) {
            original[i] = (float) Math.sin(i * 0.01);
        }

        String serialized = converter.convertToDatabaseColumn(original);
        float[] restored = converter.convertToEntityAttribute(serialized);

        assertThat(restored).hasSize(384);
        for (int i = 0; i < 384; i++) {
            assertThat(restored[i]).isEqualTo(original[i]);
        }
    }

    @Test
    @DisplayName("returns null for null input in both directions")
    void handlesNullInBothDirections() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
    }
}
