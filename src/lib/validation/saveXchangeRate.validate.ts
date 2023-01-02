import { z } from 'zod';

export const saveXchangeRateDetailsSchema = z.object({
    id: z.number().optional(),
    currency: z.string(),
    rate: z.number()
}).passthrough();

export const saveXchangeRateSchema = z.object({
    id: z.number().optional(),
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false),
    xChangeRateDate: z.string().datetime(),
    XchangeRateDetails: z.array(saveXchangeRateDetailsSchema)
}).passthrough();

export type SaveXchangeRate = z.infer<typeof saveXchangeRateSchema>;
export type SaveXchangeRateKeys = keyof SaveXchangeRate;
