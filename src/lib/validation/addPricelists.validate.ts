import { z } from 'zod';

const PricelistsItem = z.object({
	embroideryTypes: z.string({ required_error: 'embroideryTypes is required' }),
	minimumPrice: z.number({ required_error: 'Minimum Price is required' }),
	minimumQuantity: z.number({ required_error: 'Minimum Quantity is required' }),
	pricePerThousandStitches: z.number({ required_error: 'Price Per Thousand Stitches is required' }),
});

export const addPricelistSchema = z.object({
	name: z.string({ required_error: 'Name is required' }),
	isActive: z.boolean({ required_error: 'isActive is required' }),
	isDefault: z.boolean({ required_error: 'isActive is required' }),
	phone: z.string({ required_error: 'Phone is required' }),
	pricelists: z.array(PricelistsItem),
});


export type AddPricelists = z.infer<typeof addPricelistSchema>;
export type AddPricelistsKeys = keyof AddPricelists;