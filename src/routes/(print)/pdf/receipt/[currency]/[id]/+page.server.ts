import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	// const order = await prisma.orders.findUnique({
	// 	where: {
	// 		id: parseInt(params.id)
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

	// const currencyType = params.currency.toUpperCase() as CurrencyType;

	// const selectedCurrency = currencyOptions.get(currencyType);

	// if (!selectedCurrency) {
	// 	return;
	// }

	// const zero = dinero({ amount: 0, currency: selectedCurrency.dineroObj });

	// return {
	// 	order,
	// 	zero: toSnapshot(zero),
	// 	selectedCurrency: selectedCurrency
	// };

	const quotationPage = async () => {
		return await router
			.createCaller(await createContext(event))
			.orders.getQuotationOrder({ id: parseInt(event.params.id), currency: event.params.currency });
	};

	return quotationPage();
}) satisfies PageServerLoad;
