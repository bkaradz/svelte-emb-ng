import prisma from '$lib/prisma/client';
import { currencyOptions, type CurrencyType } from '$lib/stores/setCurrency.store';
import { dinero, toSnapshot } from 'dinero.js';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
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

	if (!order) {
		return;
	}

	const currencyType = params.currency.toUpperCase() as CurrencyType;

	const selectedCurrency = currencyOptions.get(currencyType);

	if (!selectedCurrency) {
		return;
	}

	const zero = dinero({ amount: 0, currency: selectedCurrency.dineroObj });

	return {
		order,
		zero: toSnapshot(zero),
		selectedCurrency: selectedCurrency
	};
}) satisfies PageServerLoad;
