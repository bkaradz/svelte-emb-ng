import { z } from 'zod';

export const loginCredentialsSchema = z
	.object({
		email: z
			.string({ required_error: 'Email is required', invalid_type_error: 'Email must be a string' })
			.email({ message: 'Not a valid email' }),
		password: z
			.string({
				required_error: 'Password is required',
				invalid_type_error: 'Password must be a string'
			})
			.min(5)
			.max(12)
	})
	.strict();

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type LoginCredentialsKeys = keyof LoginCredentials;
