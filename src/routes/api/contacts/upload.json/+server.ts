import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma/client';
import { querySelection } from '../../contacts.json/+server';
import parseCsv from '$lib/utility/parseCsv';
import type { Contacts } from '@prisma/client';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const createDBy = parseInt(locals.user.id);

		const data = await request.formData();

		const file = data.get('contacts');

		if (!(Object.prototype.toString.call(file) === '[object File]') || file === null) {
			logger.error('File is empty');
			return new Response(JSON.stringify({ message: 'File is empty' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 400
			});
		}

		const csvString = await file.text() as string;

		type pContact = Partial<Contacts>

		const contactsArray = await parseCsv(csvString) as pContact[];

		const allDocsPromises: pContact[] = [];

		contactsArray.forEach(async (element) => {
			try {
				const contact = querySelection(element, createDBy);
				const contactsQuery = await prisma.contacts.create({ data: contact });
				allDocsPromises.push(contactsQuery);
			} catch (err: unknown) {
				logger.error(`Error: ${err}`);
				return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
					headers: {
						'content-type': 'application/json; charset=utf-8'
					},
					status: 500
				});
			}
		});

		const allDocs = await Promise.all(allDocsPromises);

		return new Response(JSON.stringify(allDocs));
	} catch (err: unknown) {
		logger.error(`Error: ${err}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8'
			},
			status: 500
		});
	}
};
