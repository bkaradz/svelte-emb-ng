import { browser } from '$app/environment';
import { createConverter } from '$lib/services/monetary';
import type { CurrencyOption } from '$lib/stores/setCurrency.store';
import { trpc } from '$lib/trpc/client';
import logger from '$lib/utility/logger';
import type { SaveOrder, SaveOrdersLine } from '$lib/validation/saveOrder.validate';
import {
	add,
	dinero,
	multiply,
	toSnapshot,
	type Dinero,
	type DineroOptions,
	type DineroSnapshot
} from 'dinero.js';

const handleCalculations = async (lineArray: SaveOrdersLine[] = [], pricelistsId: number) => {
	console.log(
		'🚀 ~ file: handleCartCalculations.ts:18 ~ handleCalculations ~ pricelistsId:',
		pricelistsId
	);
	console.log(
		'🚀 ~ file: handleCartCalculations.ts:18 ~ handleCalculations ~ lineArray:',
		lineArray
	);
	try {
		return await trpc().cart.calculateCart.mutate({
			pricelistsID: pricelistsId,
			OrderLine: lineArray
		});
	} catch (err: any) {
		logger.error(`Error: ${err}`);
		throw new Error('Error occurred during calculations');
	}
};

const handleCurrency = async (
	order: SaveOrder,
	selectedCurrency: CurrencyOption,
	zero: Dinero<number>
) => {
	/**
	 * Calculate using the cart default usd currency
	 */
	let newArray;
	if (browser) {
		newArray = await handleCalculations(order.OrderLine, order.pricelistsID);
	}
	if (!Array.isArray(newArray)) {
		return;
	}

	const convert = createConverter(selectedCurrency.dineroObj);

	order.OrderLine = newArray.map((item) => {
		let unitPrice = convert(
			dinero(item.unitPrice as unknown as DineroOptions<number>),
			selectedCurrency.dineroObj
		);
		if (!unitPrice) {
			unitPrice = zero;
		}

		return { ...item, unitPrice: toSnapshot(unitPrice) };
	});

	return order;
};

const getCountAndSubTotal = (cart: SaveOrdersLine[], zero: Dinero<number>) => {
	const totals = cart.reduce(
		(acc, item) => {
			const unitPrice = item.unitPrice as DineroSnapshot<number>;
			return {
				totalCartItems: acc.totalCartItems + item.quantity,
				subTotal: add(acc.subTotal, multiply(dinero(unitPrice), item.quantity))
			};
		},
		{ totalCartItems: 0, subTotal: zero }
	);
	const totalCartItems = totals.totalCartItems;
	const subTotal = totals.subTotal;
	return { totalCartItems, subTotal };
};

export const handleCartCalculations = async (
	oldOrder: SaveOrder,
	selectedCurrency: CurrencyOption
) => {
	const zero = dinero({ amount: 0, currency: selectedCurrency.dineroObj });

	const order = structuredClone(oldOrder);

	const newOrder = await handleCurrency(order, selectedCurrency, zero);

	if (!newOrder) {
		throw new Error('Error in calculations');
	}

	const subTotalsCalc = getCountAndSubTotal(newOrder.OrderLine, zero);

	/**
	 * TODO: User the vat rate in the database
	 */
	const vat = 0;

	const calculatedVat = multiply(subTotalsCalc.subTotal, { amount: vat, scale: 2 });

	const calculatedTotal = add(calculatedVat, subTotalsCalc.subTotal);

	const results = {
		totalCartItems: subTotalsCalc.totalCartItems,
		subTotal: subTotalsCalc.subTotal,
		calculatedVat,
		grandTotal: calculatedTotal,
		order: newOrder,
		vat
	};
	return results;
};
