import { z } from 'zod';

const PricelistsItem = z.object({
	embroideryTypes: z.string({ required_error: 'embroideryTypes is required' }).min(1),
	minimumPrice: z.number({ required_error: 'Minimum Price is required' }),
	minimumQuantity: z.number({ required_error: 'Minimum Quantity is required' }),
	pricePerThousandStitches: z.number({ required_error: 'Price Per Thousand Stitches is required' }),
});

export const savePricelistSchema = z.object({
	name: z.string({ required_error: 'Name is required' }).min(1),
	isActive: z.boolean({ required_error: 'isActive is required' }),
	isDefault: z.boolean({ required_error: 'isDefault is required' }),
	pricelistDetails: z.array(PricelistsItem, { required_error: 'pricelistDetails is required' }),
});


export type SavePricelists = z.infer<typeof savePricelistSchema>;
export type SavePricelistsKeys = keyof SavePricelists;