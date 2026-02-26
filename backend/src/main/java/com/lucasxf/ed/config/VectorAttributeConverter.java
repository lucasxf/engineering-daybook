package com.lucasxf.ed.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA {@link AttributeConverter} that maps a Java {@code float[]} to the pgvector
 * text format {@code "[f1,f2,...,fn]"} and back.
 *
 * <p>Write path: combined with {@code @ColumnTransformer(write = "CAST(? AS vector)")} on
 * the entity field, which instructs PostgreSQL to explicitly cast the text parameter to
 * {@code vector}. This avoids a JDBC type mismatch ("column is of type vector but expression
 * is of type character varying") when Hibernate binds a {@code String} to a {@code vector}
 * column via a prepared statement.
 *
 * <p>Read path: {@code ResultSet.getString()} on any PostgreSQL column type returns its
 * text representation, so vector columns return {@code "[f1,f2,...,fn]"} directly — no
 * explicit read transform needed.
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
