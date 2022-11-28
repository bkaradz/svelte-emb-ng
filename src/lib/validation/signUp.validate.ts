import { z } from 'zod';

export const UserSignUpSchema = z
	.object({
		name: z
			.string({ required_error: 'Name is required', invalid_type_error: 'Name must be a string' })
			.min(3)
			.trim(),
		email: z
			.string({ required_error: 'Email is required' })
			.email({ message: 'Not a valid email' }),
		phone: z.string({ required_error: 'Phone is required' }),
		address: z.string({ required_error: 'Address is required' }),
		password: z.string({ required_error: 'Password is required' }).min(5).max(12),
		confirmPassword: z.string({ required_error: 'Confirm Password is required' })
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export type UserSignUp = z.infer<typeof UserSignUpSchema>;
export type UserSignUpSchemaKeys = keyof UserSignUp;