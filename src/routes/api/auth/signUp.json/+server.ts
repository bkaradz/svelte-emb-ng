import type { RequestHandler } from './$types';
import logger from '$lib/utility/logger';
import prisma from '$lib/server/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import config from 'config';

export const UserSignUpSchema = z
	.object({
		name: z
			.string({ required_error: 'Name is required', invalid_type_error: 'Name must be a string' })
			.trim(),
		email: z
			.string({ required_error: 'Email is required' })
			.email({ message: 'Not a valid email' }),
		phone: z.string({ required_error: 'Phone is required' }),
		address: z.string({ required_error: 'Address is required' }),
		password: z.string({ required_error: 'Password is required' }),
		confirmPassword: z.string({ required_error: 'Confirm Password is required' })
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export type User = z.infer<typeof UserSignUpSchema>;

export const POST: RequestHandler = async ({ request }) => {
	try {
		const reqUser: User = await request.json();

		const parsedUser = UserSignUpSchema.safeParse(reqUser);

		if (!parsedUser.success) {
			return new Response(JSON.stringify({ message: parsedUser.error }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 400
			});
		}

		const userExist = await prisma.email.findUnique({
			where: {
				email: reqUser.email
			}
		});

		if (userExist) {
			return new Response(JSON.stringify({ message: 'User with that email already exist' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 409
			});
		}

		const allUsers = await prisma.contacts.findMany();

		/**
		 * If the database has no ADMIN create one,
		 * other users are activated by the first ADMIN
		 */
		let role;
		if (allUsers.length === 0) {
			role = {
				userRole: 'ADMIN',
				isUser: true,
				isActive: true
			};
		} else {
			role = {
				userRole: 'USER',
				isUser: true,
				isActive: false
			};
		}

		const salt = await bcrypt.genSalt(config.get('saltWorkFactor'));

		const hash = bcrypt.hashSync(reqUser.password, salt);

		reqUser.password = hash;

		const { confirmPassword, ...restReqUser } = reqUser;

		const user = await prisma.contacts.create({
			data: {
				...restReqUser,
				...role,
				email: {
					create: [
						{
							email: reqUser.email
						}
					]
				},
				phone: {
					create: [
						{
							phone: reqUser.phone
						}
					]
				},
				address: {
					create: [
						{
							address: reqUser.address
						}
					]
				}
			}
		});

		const { password, ...restUser } = user;

		return new Response(JSON.stringify(restUser));
	} catch (err: any) {
		logger.error(`Error: ${err}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8'
			},
			status: 500
		});
	}
};
