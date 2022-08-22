import { json as json$1 } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import ContactsModel, { type ContactsDocument } from '$lib/models/contacts.model';
import logger from '$lib/utility/logger';
import { z } from "zod";

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
			return json$1({
				status: 400,
				errors: { message: parsedUser.error }
			});
		}

		const userExist = await ContactsModel.findOne({ email: reqUser.email });

		if (userExist) {
			return json$1({
				status: 409,
				errors: { message: 'User with that email already exist' }
			});
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

		return json$1(contacts);

	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return json$1({
			status: 500,
			errors: { message: `A server error occurred ${err}` }
		});
	}
};