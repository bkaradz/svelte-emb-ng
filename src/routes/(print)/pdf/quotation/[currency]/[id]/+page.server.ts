import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types';
import { dinero, toSnapshot } from 'dinero.js';
import { getCurrencyOptions, type CurrencyOption } from '$lib/stores/setCurrency.store';

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

	const currencyOptionsMap = new Map<string, CurrencyOption>();

	getCurrencyOptions().forEach((item) => {
		currencyOptionsMap.set(item.currency, item);
	});

	const selectedCurrency = currencyOptionsMap.get(params.currency.toUpperCase());

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
