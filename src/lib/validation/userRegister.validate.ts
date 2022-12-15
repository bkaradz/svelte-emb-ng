import { z } from 'zod';

export const UserRegisterSchema = z
	.object({
		name: z
			.string({
				required_error: "Name is required",
				invalid_type_error: "Name must be a string",
			})
			.min(3)
			.trim(),
		email: z.array(
			z.object({
				email: z
					.string({
						required_error: "Email is required",
						invalid_type_error: "Email must be a string",
					}).email()
			}).passthrough()),
		phone: z.array(
			z.object({
				phone: z.string({
					required_error: "Phone is required",
					invalid_type_error: "Phone must be a string",
				})
			}).passthrough()
		),
		address: z.array(
			z.object({
				address: z.string({
					required_error: "Address is required",
					invalid_type_error: "Address must be a string",
				})
			}).passthrough()
		),
		password: z.string({
			required_error: "Password is required",
			invalid_type_error: "Password must be a string",
		}).min(5).max(12),
		confirmPassword: z.string({
			required_error: "Confirm Password is required",
			invalid_type_error: "Confirm Password must be a string",
		})
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export type UserRegister = z.infer<typeof UserRegisterSchema>;
export type UserRegisterSchemaKeys = keyof UserRegister;