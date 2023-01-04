import { z } from 'zod';
import { saveOrdersLineSchema } from './saveOrder.validate';

export const calculateCartSchema = z.object({
  pricelistsID: z.number(),
  orderLine: z.array(saveOrdersLineSchema)
}).passthrough();

export type CalculateCartSchema = z.infer<typeof calculateCartSchema>;
export type CalculateCartSchemaKeys = keyof CalculateCartSchema;
