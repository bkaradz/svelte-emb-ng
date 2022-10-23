import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const order = await prisma.orders.findUnique({
		where: {
			id: parseInt(params.id)
		},
		include: {
			customerContact: true,
			Pricelists: true,
			OrderLine: {
				include: {
					Products: true
				}
			}
		}
	});

	return {
		order
	};
};
