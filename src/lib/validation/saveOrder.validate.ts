import { z } from 'zod';

export const saveOrdersLineSchema = z.object({
  productsID: z.number(),
  quantity: z.number()
}).passthrough();

export const saveOrdersSchema = z.object({
  id: z.number().optional(),
  orderDate: z.string().datetime().optional(),
  deliveryDate: z.string().datetime().optional(),
  customersID: z.number(),
  pricelistsID: z.number(),
  isActive: z.boolean(),
  accountsStatus: z.string(),
  orderLine: z.array(saveOrdersLineSchema)
}).passthrough();


export type SaveOrder = z.infer<typeof saveOrdersSchema>;
export type SaveOrderKeys = keyof SaveOrder;