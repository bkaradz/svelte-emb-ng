import { z } from 'zod';

export const editUserSchema = z
	.object({
		id: z.number().optional(),
		name: z
			.string({
				required_error: 'Name is required',
				invalid_type_error: 'Name must be a string'
			})
			.min(3)
			.trim(),
		email: z.array(
			z.object({
				email: z.string({ required_error: 'Email is required' }).email()
			})
		),
		// .nonempty(),
		phone: z.array(
			z.object({
				phone: z.string({ required_error: 'Phone is required' })
			})
		),
		address: z.array(
			z.object({
				address: z.string({ required_error: 'Address is required' })
			})
		),
		password: z.string({
			required_error: 'Password is required',
			invalid_type_error: 'Password must be a string'
		})
	})
	.passthrough();

export type EditUser = z.infer<typeof editUserSchema>;
export type EditUserKeys = keyof EditUser;

export const userRegisterSchema = editUserSchema
	.omit({ password: true })
	.extend({
		password: z
			.string({
				required_error: 'Password is required',
				invalid_type_error: 'Password must be a string'
			})
			.min(5)
			.max(12),
		confirmPassword: z.string({
			required_error: 'Confirm Password is required',
			invalid_type_error: 'Confirm Password must be a string'
		})
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export type UserRegister = z.infer<typeof userRegisterSchema>;
export type UserRegisterKeys = keyof UserRegister;
