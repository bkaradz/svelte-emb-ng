import { json as json$1 } from '@sveltejs/kit';
import pickBy from 'lodash-es/pickBy';
import identity from 'lodash-es/identity';
import logger from '$lib/utility/logger';
import csv from 'csvtojson';
import type { RequestHandler } from './$types';
import { z } from "zod";
import prisma from '$lib/prisma/client';
import { querySelection } from '../../contacts.json/+server';


export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 401
			});
		}

		const createDBy = locals.user.id;
		console.log("🚀 ~ file: +server.ts ~ line 25 ~ constPOST:RequestHandler= ~ createDBy", createDBy)

		const data = await request.formData();

		const file = data.get('contacts');

		if (!(Object.prototype.toString.call(file) === '[object File]') || file === null) {
			logger.error('File is empty');
			return new Response(JSON.stringify({ message: 'File is empty' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 400
			});
		}

		const csvString = await file.text();

		const jsonArray = await csv()
			.preFileLine((fileLine, idx) => {
				if (idx === 0) {
					return fileLine.toLowerCase();
				}
				return fileLine;
			})
			.fromString(csvString);

		const allDocsPromises: any[] = []

		jsonArray.forEach(async (element) => {
			try {
				const contact = querySelection(element, createDBy)
				const contactsQuery = await prisma.contacts.create({ data: contact })
				allDocsPromises.push(contactsQuery)
			} catch (err: any) {
				logger.error(`Error: ${err.message}`)
				return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
					headers: {
						'content-type': 'application/json; charset=utf-8',
					},
					status: 500
				});
			}
		});

		const allDocs = await Promise.all(allDocsPromises)

		return new Response(JSON.stringify(allDocs));

	} catch (err: any) {
		logger.error(`Error: ${err.message}`)
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8',
			},
			status: 500
		});
	}
};
