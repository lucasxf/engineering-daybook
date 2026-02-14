import { z } from 'zod';

/**
 * Zod validation schema for POK creation and updates.
 *
 * Rules (matching backend validation):
 * - title: optional (0-200 characters)
 * - content: mandatory (1-50,000 characters)
 */
export const pokSchema = z.object({
  title: z
    .string()
    .max(200, 'Title must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  content: z
    .string()
    .min(1, 'Content is required and must not be blank')
    .max(50000, 'Content must be between 1 and 50,000 characters')
    .refine((val) => val.trim().length > 0, {
      message: 'Content is required and must not be blank',
    }),
});

/**
 * TypeScript type inferred from pokSchema.
 */
export type PokFormData = z.infer<typeof pokSchema>;
