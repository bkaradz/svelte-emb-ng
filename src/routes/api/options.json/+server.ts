import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma/client';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const queryParams = Object.fromEntries(url.searchParams);

		const objectKeys = Object.keys(queryParams)[0];

		let query: any;

		if (objectKeys) {
			query = {
				where: {
					isActive: true,
					[objectKeys]: {
						contains: queryParams[objectKeys],
						mode: 'insensitive'
					}
				},
				orderBy: {
					label: 'asc'
				}
			};
		} else {
			query = {
				where: {
					isActive: true
				},
				orderBy: {
					label: 'asc'
				}
			};
		}

		const options = await prisma.options.findMany(query);

		return new Response(JSON.stringify(options));
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

export const changeCurrentDefault = async (group: string) => {
	await prisma.options.updateMany({
		where: {
			group,
			isDefault: {
				equals: true
			}
		},
		data: { isDefault: false }
	});
};

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

		const reqOptions = await request.json();

		/**
		 * TODO: VALIDATION using zod
		 */

		let { label, group, value, isActive, isDefault } = reqOptions;

		label = label.trim();
		group = group.trim();
		value = value.trim();
		isActive = isActive === 'true' ? true : false;
		isDefault = isDefault === 'true' ? true : false;

		if (isDefault) {
			changeCurrentDefault(group);
		}

		const option = {
			createdBy: createDBy,
			label,
			group,
			value,
			isActive,
			isDefault
		};

		const optionsQuery = await prisma.options.create({ data: option });

		return new Response(JSON.stringify(optionsQuery));
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

export const PUT: RequestHandler = async ({ locals, request }) => {
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

		const reqOptions = await request.json();

		/**
		 * TODO: VALIDATION usung zod
		 */

		let { label, group, value, isActive, isDefault } = reqOptions;

		label = label.trim();
		group = group.trim();
		value = value.trim();
		isActive = isActive === 'true' ? true : false;
		isDefault = isDefault === 'true' ? true : false;

		const option = {
			createdBy: createDBy,
			label,
			group,
			value,
			isActive,
			isDefault
		};

		const optionsQuery = await prisma.options.update({
			where: {
				id: parseInt(reqOptions.id)
			},
			data: option
		});

		return new Response(JSON.stringify(optionsQuery));
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

		const createdBy = parseInt(locals.user.id);

		const reqOptions = await request.json();

		const optionsQuery = await prisma.options.update({
			where: {
				id: parseInt(reqOptions.id)
			},
			data: { createdBy, isActive: false }
		});

		return new Response(JSON.stringify(optionsQuery));
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
