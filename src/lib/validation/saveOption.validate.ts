import { z } from 'zod';

export const saveOptionsSchema = z
	.object({
		id: z.number().optional(),
		group: z.string().trim(),
		isActive: z.boolean().default(true),
		isDefault: z.boolean().default(false),
		label: z.string().trim(),
		value: z.string().trim()
	})
	.passthrough();

export type SaveOption = z.infer<typeof saveOptionsSchema>;
export type SaveOptionKeys = keyof SaveOption;
