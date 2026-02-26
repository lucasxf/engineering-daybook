package com.lucasxf.ed.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA {@link AttributeConverter} that maps a Java {@code float[]} to the pgvector
 * text format {@code "[f1,f2,...,fn]"} and back.
 *
 * <p>pgvector accepts vectors in this bracket-enclosed, comma-separated format when
 * cast from text: {@code CAST(:vector AS vector)}. This converter handles the
 * serialisation transparently for any {@code @Column(columnDefinition = "vector(N)")} field.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@Converter
public class VectorAttributeConverter implements AttributeConverter<float[], String> {

    /**
     * Converts a {@code float[]} to the pgvector text format {@code "[f1,f2,...,fn]"}.
     *
     * @param attribute the Java-side float array (may be null)
     * @return pgvector text representation, or null if the input is null
     */
    @Override
    public String convertToDatabaseColumn(float[] attribute) {
        if (attribute == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < attribute.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(attribute[i]);
        }
        sb.append(']');
        return sb.toString();
    }

    /**
     * Parses a pgvector text value {@code "[f1,f2,...,fn]"} into a {@code float[]}.
     *
     * @param dbData the database-side string (may be null)
     * @return the parsed float array, or null if the input is null
     */
    @Override
    public float[] convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        // Strip surrounding brackets
        String stripped = dbData.substring(1, dbData.length() - 1);
        String[] parts = stripped.split(",");
        float[] result = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Float.parseFloat(parts[i].trim());
        }
        return result;
    }
}
