import { z } from 'zod';

export const saveExchangeRateDetailsSchema = z.object({
    id: z.number().optional(),
    currency: z.string(),
    rate: z.number()
}).passthrough();

export const saveExchangeRateSchema = z.object({
    id: z.number().optional(),
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false),
    xChangeRateDate: z.string().datetime(),
    ExchangeRateDetails: z.array(saveExchangeRateDetailsSchema)
}).passthrough();

export type SaveExchangeRate = z.infer<typeof saveExchangeRateSchema>;
export type SaveExchangeRateKeys = keyof SaveExchangeRate;
