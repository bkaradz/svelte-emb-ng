import { z } from 'zod';

export const addProductsSchema = z.object({
	name: z
		.string({ required_error: 'Name is required', invalid_type_error: 'Name must be a string' })
		.min(1)
		.trim(),
	description: z.string().optional(),
	productCategories: z.string({ required_error: 'Product Category is required' }).min(1),
	stitches: z.number().optional(),
	unitPrice: z.number().optional(),
	units: z.number().optional(),
}).superRefine((data, ctx) => {

	if (data.productCategories === 'embroidery' && !data.stitches) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: `Stitches are required`,
			path: ["stitches"]
		});
		z.NEVER
	}
	if (data.productCategories !== 'embroidery' && !(data.unitPrice && data.units)) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: `Unit Price and Units are required`,
			path: ["unitPrice", "units"]
		});
	}

});


export type AddProduct = z.infer<typeof addProductsSchema>;
export type AddProductKeys = keyof AddProduct;