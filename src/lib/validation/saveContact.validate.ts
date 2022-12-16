import { z } from 'zod';

export const addContactsSchema = z.object({
	name: z
		.string({ required_error: 'Name is required', invalid_type_error: 'Name must be a string' })
		.min(1)
		.trim(),
	email: z.string().email({ message: 'Not a valid email' }).optional(),
	phone: z.string({ required_error: 'Phone is required' }).min(1),
	address: z.string().optional(),
	isCorporate: z.boolean({ required_error: 'Corporate or Individual is required' }),
	organisationID: z.number().optional(),
	vatOrBpNo: z.string().optional()
});


export type AddContact = z.infer<typeof addContactsSchema>;
export type AddContactKeys = keyof AddContact;