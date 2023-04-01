import { z } from 'zod';
import { saveContactsSchema } from './saveContact.validate';
import { savePricelistDetailsSchema } from './savePricelist.validate';
import { saveProductsSchema } from './saveProduct.validate';

export const saveOrdersLineSchema = z
	.object({
		id: z.number().optional(),
		productsID: z.number(),
		embroideryTypes: z.string(),
		quantity: z.number(),
		Products: saveProductsSchema,
		unitPrice: z.number().optional().or(z.object({}))
	})
	.passthrough();

export type SaveOrdersLine = z.infer<typeof saveOrdersLineSchema>;

export const saveOrdersSchema = z
	.object({
		id: z.number().optional(),
		orderDate: z.string().datetime().optional(),
		deliveryDate: z.string().datetime().optional(),
		customersID: z.number(),
		pricelistsID: z.number(),
		isActive: z.boolean(),
		accountsStatus: z.string(),
		OrderLine: z.array(saveOrdersLineSchema),
		customerContact: saveContactsSchema.optional(),
		Pricelists: savePricelistDetailsSchema.optional()
	})
	.passthrough();

export type SaveOrder = z.infer<typeof saveOrdersSchema>;
export type SaveOrderKeys = keyof SaveOrder;
