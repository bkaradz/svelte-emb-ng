import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {

	const order = await prisma.orders.findUnique({
		where: {
			id: parseInt(params.id)
		}
	});

	if (!order?.customersID) {
		return;
	}
	const customer = await prisma.contacts.findUnique({
		where: {
			id: order.customersID
		}
	});

	const allOrder = await prisma.orders.findMany({
		where: {
			customersID: order.customersID,
			isInvoiced: {
				equals: true
			}
		},
		include: {
			Payments: {
				include: {
					PaymentDetails: true,
					XchangeRate: true
				}
			}
		}
	});

	return {
		customer,
		allOrder
	};
};
