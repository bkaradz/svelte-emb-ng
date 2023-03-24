import prisma from '$lib/prisma/client';
import { dinero, toSnapshot } from 'dinero.js';
import { currencyOptions, type CurrencyType } from '$lib/stores/setCurrency.store';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {

	const quotationPage = async () => {
		return await router.createCaller(await createContext(event)).orders.getQuotationOrder({ id: event.params.id, currency: event.params.currency });
	};



	// const order = await prisma.orders.findUnique({
	// 	where: {
	// 		id: parseInt(event.params.id)
	// 	},
	// 	include: {
	// 		customerContact: true,
	// 		Pricelists: true,
	// 		OrderLine: {
	// 			include: {
	// 				Products: true
	// 			}
	// 		}
	// 	}
	// });

	// if (!order) {
	// 	return;
	// }

	// const currencyType = event.params.currency.toUpperCase() as CurrencyType;

	// const selectedCurrency = currencyOptions.get(currencyType);

	// if (!selectedCurrency) {
	// 	return;
	// }

	// const zero = dinero({ amount: 0, currency: selectedCurrency.dineroObj });

	return quotationPage()
	
}) satisfies PageServerLoad;
