import type { RequestHandler } from '@sveltejs/kit';
import ContactsModel, {type ContactsDocument} from '$lib/models/contacts.model';
import logger from '$lib/utility/logger';
import { z } from "zod";

const UserSchema = z.object({
	name: z.string(), // { required_error: 'Name is required'}
	email: z.string().email(), //  { required_error: 'Email is required'}  'Not a valid email'
	phone: z.string(), //  { required_error: 'Phone is required'}
	address: z.string(), //  { required_error: 'Address is required'}
	password: z.string(), //  { required_error: 'Password is required'}
	confirmPassword: z.string() //  { required_error: 'Name is required'}
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword']
})

export type User = z.infer<typeof UserSchema>

export const POST: RequestHandler = async ({ request }): Promise<{status: number, body: {error: any} | {message: string} | Omit<ContactsDocument, 'password'>}> => {
	try {
		const reqUser: User = await request.json();

		const parsedUser = UserSchema.safeParse(reqUser)

		if (!parsedUser.success) {
			return {
				status: 400,
				body: {
					error: parsedUser.error
				}
			};
		}

		const userExist = await ContactsModel.findOne({ email: reqUser.email });

		if (userExist) {
			return {
				status: 409,
				body: {
					message: 'User with that email already exist'
				}
			};
		}

		const contacts = new ContactsModel(reqUser);

		const allUsers = await ContactsModel.find({
			isUser: true,
			isActive: true,
			userRole: 'ADMIN'
		}).select('-password');

		/**
		 * If the database has no ADMIN create one,
		 * other users are activated by the first ADMIN
		 */
		if (allUsers.length === 0) {
			contacts.userRole = 'ADMIN';
			contacts.isActive = true;
		} else {
			contacts.userRole = 'USER';
			contacts.isActive = false;
		}

		contacts.isUser = true;

		await contacts.save();

		delete contacts.password

		return {
			status: 200,
			body: contacts,
		};
	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return {
			status: 500,
			body: {
				error: `A server error occurred ${err}`
			}
		};
	}
};