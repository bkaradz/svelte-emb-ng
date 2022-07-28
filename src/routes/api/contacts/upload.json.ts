import { postSuite } from '$lib/validation/server/contacts.validate';
import ContactsModel, { type ContactsDocument } from '$lib/models/contacts.model';
import pickBy from 'lodash-es/pickBy';
import identity from 'lodash-es/identity';
import logger from '$lib/utility/logger';
import csv from 'csvtojson';
import type { RequestHandler } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').RequestHandler}*/
export const POST: RequestHandler = async ({
	request,
	locals
}): Promise<{
	status: number;
	body: { error: string } | { message: string };
}> => {
	try {
		if (!locals?.user?._id) {
			return {
				status: 401,
				body: {
					message: 'Unauthorized'
				}
			};
		}

		const userId = locals.user._id;

		const data = await request.formData();

		const file: FormDataEntryValue | null = data.get('contacts');

		if (!(Object.prototype.toString.call(file) === '[object File]')) {
			logger.error('File is empty');
			return {
				status: 400,
				body: {
					message: 'File is empty'
				}
			};
		}
		// @ts-expect-error: the above if statement catches the error if file is null
		const csvString = await file.text();

		const jsonArray = await csv()
			.preFileLine((fileLine, idx) => {
				if (idx === 0) {
					return fileLine.toLowerCase();
				}
				return fileLine;
			})
			.fromString(csvString);

		jsonArray.forEach(async (element) => {
			let { name, email, phone }: Partial<ContactsDocument> = element;
			const {
				isCorporate,
				balanceDue,
				totalReceipts,
				notes,
				address,
				vatOrBpNo
			}: Partial<ContactsDocument> = element;

			// const name = Name.replace(/Emb$/gm, '').trim();
			name = name.trim();
			email = email.trim();
			phone = phone.split(',')[0].trim().replace(/ /g, '');

			const contact: Partial<ContactsDocument> = {
				name,
				email,
				phone,
				isActive: true,
				isUser: false,
				userID: userId,
				totalReceipts,
				balanceDue,
				isCorporate,
				notes,
				address,
				vatOrBpNo
			};

			const contactFiltered = pickBy(contact, identity);

			const result = postSuite(contactFiltered);

			if (result.hasErrors()) {
				logger.error(result.getErrors());
				return {
					status: 400,
					body: {
						message: result.getErrors()
					}
				};
			}

			const newContacts = new ContactsModel(contactFiltered);

			await newContacts.save();
		});

		return {
			status: 200,
			body: {
				message: 'Contacts Uploaded'
			}
		};
	} catch (err) {
		logger.error(`Error: ${err.message}`)
    return {
      status: 500,
      body: {
        error: `A server error occurred ${err}`,
      },
    }
	}
};
