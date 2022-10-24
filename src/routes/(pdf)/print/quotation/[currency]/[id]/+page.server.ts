import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types';
import { calculateOrder } from '$lib/services/orders';
import { add, dinero, multiply, toSnapshot } from 'dinero.js';
import { createConverter } from '$lib/services/monetary';
import { getCurrencyOptions, type CurrencyOption } from '$lib/stores/setCurrency.store';

export const load: PageServerLoad = async ({ params }) => {
	console.log('params', params);
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
		return
	}

	order.orderLine = JSON.parse(JSON.stringify(order.OrderLine))

	delete order.OrderLine

	const currencyOptionsMap = new Map<string, CurrencyOption>()

	getCurrencyOptions().forEach((item) => {
		currencyOptionsMap.set(item.currency, item)
	})

	let selectedCurrency = currencyOptionsMap.get(params.currency.toUpperCase())

	if (!selectedCurrency) {
		return
	}

	const handleCurrency = async (lineArray: unknown[], selectedCurrency: CurrencyOption) => {
		const zero = dinero({ amount: 0, currency: selectedCurrency.dineroObj });
		/**
		 * Calculate using the cart default usd currency
		 */
		const newArray = await calculateOrder(order);

		if (!Array.isArray(newArray)) {
			return;
		}

		const convert = createConverter(selectedCurrency.dineroObj);
		order.orderLine = [...newArray.map((item) => {
			let unitPrice = convert(dinero(item.unitPrice), selectedCurrency.dineroObj);
			if (!unitPrice) {
				unitPrice = zero;
			}
			return { ...item, unitPrice: toSnapshot(unitPrice) };
		})]

		getCountAndSubTotal(order.orderLine)
	};

	handleCurrency(order.orderLine, selectedCurrency)

	const zero = dinero({ amount: 0, currency: selectedCurrency.dineroObj });


	// let subTotal = zero;

	const getCountAndSubTotal = (cart: any[]) => {
		const totals = cart.reduce(
			(acc, item) => {
				// console.log('object', item);
				return {
					subTotal: add(acc.subTotal, multiply(dinero(item.unitPrice), item.quantity))
				};
			},
			{ subTotal: zero }
		);

		order.subTotal = toSnapshot(totals.subTotal);
	};

	console.log("🚀 ~ file: +page.server.ts ~ line 101 ~ constload:PageServerLoad= ~ order", order?.orderLine)

	return {
		order,
		zero: toSnapshot(zero),
		// subTotal: toSnapshot(subTotal),
		selectedCurrency: selectedCurrency.dineroObj
	};
};
