import { z } from 'zod';

export const loginCredentialsSchema = z
	.object({
		email: z
			.string({ required_error: 'Email is required' })
			.email({ message: 'Not a valid email' }),
		password: z.string({ required_error: 'Password is required' }).min(5).max(12)
	})
	.strict();

export type loginCredentials = z.infer<typeof loginCredentialsSchema>;
export type loginCredentialsKeys = keyof loginCredentials;

