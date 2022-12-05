import { z } from 'zod';

export const addProductsSchema = z.object({
	name: z
		.string({ required_error: 'Name is required', invalid_type_error: 'Name must be a string' })
		.trim(),
	description: z.string().optional(),
	productCategories: z.string({ required_error: 'Product Category is required' }),
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
	}
	if (data.productCategories !== 'embroidery' && !data.unitPrice) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: `Unit Price is required`,
			path: ["unitPrice"]
		});
	}
	if (data.productCategories !== 'embroidery' && !data.units) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: `Number of Units are required`,
			path: ["units"]
		});
	}
});


export type AddProduct = z.infer<typeof addProductsSchema>;
export type AddProductKeys = keyof AddProduct;