import { z } from 'zod';

interface LearningSchemaMessages {
  contentRequired: string;
  titleTooLong: string;
  contentTooLong: string;
}

/**
 * Factory for the Learning creation Zod schema.
 * Accepts translated error messages so validation errors are always localized.
 *
 * Rules:
 * - title: optional (0-200 characters)
 * - content: mandatory (1-50,000 characters)
 */
export function createLearningSchema(messages: LearningSchemaMessages) {
  return z.object({
    title: z
      .string()
      .max(200, messages.titleTooLong)
      .optional()
      .or(z.literal('')),

    content: z
      .string()
      .min(1, messages.contentRequired)
      .max(50000, messages.contentTooLong)
      .refine((val) => val.trim().length > 0, {
        message: messages.contentRequired,
      }),
  });
}

/**
 * TypeScript type for Learning form data.
 */
export type LearningFormData = {
  title?: string;
  content: string;
};
