import { USD } from '@dinero.js/currencies';
import { add, dinero, greaterThanOrEqual, multiply, subtract, toSnapshot, type Dinero, type DineroSnapshot } from 'dinero.js';
import logger from '$lib/utility/logger';
import { getQuantityPricelist } from '$lib/services/getQuantityPricelist.services';
import type { PricelistsDocument } from '$lib/models/pricelists.model';

export const calculateOrder = (order: any, pricelist: PricelistsDocument) => {
	let { balance, subTotal, discountRate, discount, taxRate, tax } = order;
	balance = dinero({ amount: 0, currency: USD, scale: 3 });

	try {
		// calculate the order list totals and unit prices
		const orderLine = order.orderLine.map((line: { unitPrice?: any; stitches?: any; quantity?: any; embroideryTypes?: any; }) => {
			const { stitches, quantity = 1, embroideryTypes = 'flat' } = line;

			if (stitches && pricelist) {
				/**
				 * Calculate prices
				 */
				const { pricePerThousandStitches, minimumPrice } = getQuantityPricelist({
					pricelist,
					embroideryTypes,
					quantity
				});

				// calculate the unit price from the stitches

				const d = dinero(JSON.parse(pricePerThousandStitches));

				const lineUnitPrice = multiply(d, { amount: stitches, scale: 3 });

				const unitPrice = greaterThanOrEqual(dinero(JSON.parse(minimumPrice)), lineUnitPrice)
					? dinero(JSON.parse(minimumPrice))
					: lineUnitPrice;

				const total = multiply(unitPrice, { amount: quantity * 100, scale: 2 });
				balance = add(balance, total);

				return {
					...line,
					total: JSON.stringify(toSnapshot(total)),
					unitPrice: JSON.stringify(toSnapshot(unitPrice))
				};
			} else {
				const total = multiply(dinero(JSON.parse(line.unitPrice)), {
					amount: quantity * 100,
					scale: 2
				});
				balance = add(balance, total);
				return { ...line, total: JSON.stringify(toSnapshot(total)) };
			}
		});

		tax = dinero({ amount: 0, currency: USD, scale: 3 });
		discount = dinero({ amount: 0, currency: USD, scale: 3 });

		if (taxRate) {
			tax = multiply(balance, { amount: taxRate * 1000, scale: 3 });
		}
		if (discountRate) {
			discount = multiply(balance, { amount: discountRate * 1000, scale: 3 });
		}
		taxRate = dinero({ amount: taxRate * 1000, currency: USD, scale: 3 });
		discountRate = dinero({ amount: discountRate * 1000, currency: USD, scale: 3 });

		const subtractMany = (subtractEnds: any[]) => subtractEnds.reduce(subtract);

		subTotal = subtractMany([balance, tax, discount]);

		return {
			...order,
			discountRate: JSON.stringify(toSnapshot(discountRate)),
			taxRate: JSON.stringify(toSnapshot(taxRate)),
			balance: JSON.stringify(toSnapshot(balance)),
			subTotal: JSON.stringify(toSnapshot(subTotal)),
			isActive: true,
			discount: JSON.stringify(toSnapshot(discount)),
			tax: JSON.stringify(toSnapshot(tax)),
			orderLine: orderLine
		};
	} catch (err: any) {
		logger.error(`Error: ${err.message}`);

	}
};
