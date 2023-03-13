import prisma from '$lib/prisma/client';
import logger from '$lib/utility/logger';
import { userRegisterSchema, type UserRegister } from '$lib/validation/userRegister.validate';
import bcrypt from 'bcrypt';
import config from 'config';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const reqUser: UserRegister = await request.json();

		const parsedUser = userRegisterSchema.safeParse(reqUser);

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
				email: reqUser.email[0].email
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
				isActive: true,
				isUserActive: true
			};
		} else {
			role = {
				userRole: 'USER',
				isUser: true,
				isActive: true,
				isUserActive: false
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
					createMany: { data: reqUser.email }
				},
				phone: {
					createMany: { data: reqUser.phone }
				},
				address: {
					createMany: { data: reqUser.address }
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
