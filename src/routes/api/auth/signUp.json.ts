import type { RequestHandler } from '@sveltejs/kit';
import ContactsModel from '$lib/models/contacts.model';
import omit from 'lodash-es/omit';
import { postSuite } from '$lib/validation/server/signUp.validate';
import logger from '$lib/utility/logger';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const reqUser = await request.json();

		// const result = postSuite(reqUser)

		// if (result.hasErrors()) {
		//   return {
		//     status: 400,
		//     body: {
		//       message: result.getErrors(),
		//     },
		//   }
		// }

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

		return {
			status: 200,
			body: omit(contacts.toJSON(), ['password', 'createdAt', 'updatedAt', '__v'])
		};
	} catch (err) {
		logger.error(`Error: ${err.message}`);
		return {
			status: 500,
			body: {
				error: `A server error occurred ${err}`
			}
		};
	}
};

// export const GET: RequestHandler = async () => {
// 	try {
// 		const contacts = await ContactsModel.find({ isUser: true, isActive: true }).select('-password');
// 		return {
// 			status: 200,
// 			body: {
// 				contacts
// 			}
// 		};
// 	} catch (err) {
// 		return {
// 			status: 500,
// 			body: {
// 				error: `A server error occurred ${err}`
// 			}
// 		};
// 	}
// };

// export const PUT: RequestHandler = async ({ request }) => {
// 	try {
// 		return {
// 			status: 200,
// 			body: {
// 				status: 'Success'
// 			}
// 		};
// 	} catch (err) {
// 		return {
// 			status: 500,
// 			body: {
// 				error: `A server error occurred ${err}`
// 			}
// 		};
// 	}
// };

// export const DELETE: RequestHandler = async ({ request }) => {
// 	return;
// };
