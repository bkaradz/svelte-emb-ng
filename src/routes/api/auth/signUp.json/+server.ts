import { json as json$1 } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import logger from '$lib/utility/logger';
import prisma from '$lib/prisma/client';
import { z } from "zod";
import bcrypt from 'bcrypt';
import config from 'config';

export const UserSchema = z.object({
	name: z.string({ required_error: "Name is required", invalid_type_error: "Name must be a string" }).trim(),
	email: z.string({ required_error: "Email is required" }).email({ message: "Not a valid email" }),
	phone: z.string({ required_error: "Phone is required" }),
	address: z.string({ required_error: "Address is required" }),
	password: z.string({ required_error: "Address is required" }),
	confirmPassword: z.string({ required_error: "Password is required" })
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword']
})

export type User = z.infer<typeof UserSchema>

export const POST: RequestHandler = async ({ request }) => {
	try {
		const reqUser: User = await request.json();

		const parsedUser = UserSchema.safeParse(reqUser)

		if (!parsedUser.success) {
			return new Response(JSON.stringify({ message: parsedUser.error }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 400
			});
		}

		const userExist = await prisma.email.findUnique({
			where: {
				email: reqUser.email,
			}
		})

		if (userExist) {
			return new Response(JSON.stringify({ message: 'User with that email already exist' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 409
			});
		}

		const allUsers = await prisma.contacts.findMany()

		/**
		 * If the database has no ADMIN create one,
		 * other users are activated by the first ADMIN
		 */
		let role
		if (allUsers.length === 0) {
			role = {
				userRole: 'ADMIN',
				isUser: true,
				isActive: true
			}
		} else {
			role = {
				userRole: 'USER',
				isUser: true,
				isActive: false
			}
		}

		const salt = await bcrypt.genSalt(config.get('saltWorkFactor'));

		const hash = bcrypt.hashSync(reqUser.password, salt);

		reqUser.password = hash;

		delete reqUser.confirmPassword

		const user = await prisma.contacts.create({
			data: {
				...reqUser,
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
		})

		if (user?.password) {
			delete user.password
		}

		return new Response(JSON.stringify(user));

	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8',
			},
			status: 500
		});
	}
};