import prisma from '$lib/prisma/client';
import logger from '$lib/utility/logger';
import { userRegisterSchema, type UserRegister } from '$lib/validation/userRegister.validate';
import { z } from 'zod';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const allUsers = await prisma.contacts.findMany({
			where: {
				isActive: true,
				isUser: true
			},
			include: {
				email: true,
				phone: true,
				address: true
			}
		});

		const allUsersFinal = allUsers.map((user) => {
			const { password, ...rest } = user;
			return rest;
		});

		return new Response(JSON.stringify(allUsersFinal));
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

// export const UserSchema = z.object({
// 	id: z.union([
// 		z.number({ required_error: 'id is required' }),
// 		z.string({ required_error: 'id is required' })
// 	]),
// 	name: z
// 		.string({ required_error: 'Name is required', invalid_type_error: 'Name must be a string' })
// 		.trim(),
// 	email: z.string({ required_error: 'Email is required' }).email({ message: 'Not a valid email' }),
// 	phone: z.string({ required_error: 'Phone is required' }),
// 	address: z.string({ required_error: 'Address is required' }),
// 	password: z.string({ required_error: 'Password is required' })
// });

// export type User = z.infer<typeof UserSchema>;

export const PUT: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const userUpdate: UserRegister = await request.json();

		const parsedUser = userRegisterSchema.safeParse(userUpdate);

		if (!parsedUser.success) {
			return new Response(JSON.stringify({ message: parsedUser.error }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 400
			});
		}

		const allUsers = await prisma.contacts.update({
			where: {
				id: (userUpdate.id)
			},
			data: {
				...userUpdate
			}
		});

		return new Response(JSON.stringify(allUsers));
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

export const DELETE: RequestHandler = async ({ locals, request }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const userDelete = await request.json();

		const createdBy = (locals.user.id);

		const userD = await prisma.contacts.update({
			where: {
				id: parseInt(userDelete.id)
			},
			data: {
				createdBy,
				isActive: false
			}
		});

		return new Response(JSON.stringify(userD));
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
