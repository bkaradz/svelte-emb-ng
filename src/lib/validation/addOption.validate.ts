import { z } from 'zod';

export const addOptionsSchema = z.object({
  id: z.number().optional(),
  group: z.string().trim(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  label: z.string().trim(),
  value: z.string().trim()
}).passthrough();

export type AddOption = z.infer<typeof addOptionsSchema>;
export type AddOptionKeys = keyof AddOption;
