import { z } from 'zod';

export const loginCredentialsSchema = z
	.object({
		username: z
			.string({ 
				required_error: 'username is required', 
				invalid_type_error: 'username must be a string' 
			}),
		password: z
			.string({
				required_error: 'Password is required',
				invalid_type_error: 'Password must be a string'
			})
	})
	.strict();

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type LoginCredentialsKeys = keyof LoginCredentials;
