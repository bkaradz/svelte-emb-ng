import { z } from 'zod';

export const savePricelistDetailsSchema = z.object({
  embroideryTypes: z.string(),
  minimumQuantity: z.number(),
  pricePerThousandStitches: z.number(),
  minimumPrice: z.number()
}).passthrough();

export const savePricelistsSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  pricelistDetails: z.array(savePricelistDetailsSchema)
}).passthrough();

export type SavePricelist = z.infer<typeof savePricelistsSchema>;
export type SavePricelistKeys = keyof SavePricelist;
