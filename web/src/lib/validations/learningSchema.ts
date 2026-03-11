import { z } from 'zod';

/**
 * Zod validation schema for Learning creation.
 *
 * Rules:
 * - title: optional (0-200 characters)
 * - content: mandatory (1-50,000 characters)
 */
export const learningSchema = z.object({
  title: z
    .string()
    .max(200, 'Title must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be between 1 and 50,000 characters')
    .refine((val) => val.trim().length > 0, {
      message: 'Content is required',
    }),
});

/**
 * TypeScript type inferred from learningSchema.
 */
export type LearningFormData = z.infer<typeof learningSchema>;
