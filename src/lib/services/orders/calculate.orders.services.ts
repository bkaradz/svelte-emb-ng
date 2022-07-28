import { USD } from '@dinero.js/currencies';
import { add, dinero, greaterThanOrEqual, multiply, subtract, toSnapshot } from 'dinero.js';
import logger from '$lib/utility/logger';
import { getQuantityPricelist } from '$lib/services/getQuantityPricelist.services';
// import ProductsModel from '$lib/models/products.models';


export const calculateOrder = (order, pricelist) => {
console.log("🚀 ~ file: calculate.orders.services.ts ~ line 9 ~ calculateOrder ~ pricelist", pricelist)
	let { balance, subTotal, discountRate, discount, taxRate, tax } = order;
	balance = dinero({ amount: 0, currency: USD, scale: 3 });

	try {
		// calculate the order list totals and unit prices
		const orderLine = order.orderLine.map((line) => {
			const { stitches, quantity = 1, embroideryTypes = 'flat' } = line;

			// const productExist = await ProductsModel.exists(line._id);

			// if (!productExist) {
			// 	throw new Error('Product does not exist');
			// }

			if (stitches && pricelist) {
				/**
				 * Calculate prices
				 */
				const { pricePerThousandStitches, minimumPrice } = getQuantityPricelist({
					pricelist,
					embroideryTypes,
					quantity
				});

				// const minimumPrice = '{"amount":1000,"currency":{"code":"USD","base":10,"exponent":2},"scale":3}'
				// const pricePerThousandStitches = '{"amount":200,"currency":{"code":"USD","base":10,"exponent":2},"scale":3}'

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

		const subtractMany = (subtrahends) => subtrahends.reduce(subtract);

		subTotal = subtractMany([balance, tax, discount]);

		return {
			...order,
			balance: JSON.stringify(toSnapshot(balance)),
			subTotal: JSON.stringify(toSnapshot(subTotal)),
			isActive: true,
			discountRate: JSON.stringify(toSnapshot(discountRate)),
			discount: JSON.stringify(toSnapshot(discount)),
			taxRate: JSON.stringify(toSnapshot(taxRate)),
			tax: JSON.stringify(toSnapshot(tax)),
			orderLine: orderLine
		};
	} catch (err) {
		logger.error(`Error: ${err.message}`);
		
	}
};
