import { USD } from '@dinero.js/currencies';
import { add, dinero, greaterThanOrEqual, multiply, subtract, toSnapshot, type Dinero, type DineroSnapshot } from 'dinero.js';
import logger from '$lib/utility/logger';
import { getQuantityPricelist } from '$lib/services/getQuantityPricelist.services';
import prisma from '$lib/prisma/client';

// export const calculateOrder = async (order: any) => {
// 	let { balance, subTotal, discountRate, discount, taxRate, tax } = order;
// 	balance = dinero({ amount: 0, currency: USD, scale: 3 });

// 	try {
// 		// calculate the order list totals and unit prices
// 		const orderLine = order.orderLine.map((line: { largestUnitPrice?: any; stitches?: any; quantity?: any; embroideryTypes?: any; }) => {
// 			const { stitches, quantity = 1, embroideryTypes = 'flat' } = line;

// 			if (stitches && pricelist) {
// 				/**
// 				 * Calculate prices
// 				 */
// 				const { pricePerThousandStitches, minimumPrice } = getQuantityPricelist({
// 					pricelist,
// 					embroideryTypes,
// 					quantity
// 				});

// 				// calculate the unit price from the stitches

// 				const dineroPrice = dinero(JSON.parse(pricePerThousandStitches));

// 				const calcUnitPrice = multiply(dineroPrice, { amount: stitches, scale: 3 });

// 				const largestUnitPrice = greaterThanOrEqual(dinero(JSON.parse(minimumPrice)), calcUnitPrice)
// 					? dinero(JSON.parse(minimumPrice))
// 					: calcUnitPrice;

// 				const total = multiply(largestUnitPrice, { amount: quantity * 100, scale: 2 });
// 				balance = add(balance, total);

// 				return {
// 					...line,
// 					total: JSON.stringify(toSnapshot(total)),
// 					largestUnitPrice: JSON.stringify(toSnapshot(largestUnitPrice))
// 				};
// 			} else {
// 				const total = multiply(dinero(JSON.parse(line.largestUnitPrice)), {
// 					amount: quantity * 100,
// 					scale: 2
// 				});
// 				balance = add(balance, total);
// 				return { ...line, total: JSON.stringify(toSnapshot(total)) };
// 			}
// 		});

// 		tax = dinero({ amount: 0, currency: USD, scale: 3 });
// 		discount = dinero({ amount: 0, currency: USD, scale: 3 });

// 		if (taxRate) {
// 			tax = multiply(balance, { amount: taxRate * 1000, scale: 3 });
// 		}
// 		if (discountRate) {
// 			discount = multiply(balance, { amount: discountRate * 1000, scale: 3 });
// 		}
// 		taxRate = dinero({ amount: taxRate * 1000, currency: USD, scale: 3 });
// 		discountRate = dinero({ amount: discountRate * 1000, currency: USD, scale: 3 });

// 		const subtractMany = (subtractEnds: any[]) => subtractEnds.reduce(subtract);

// 		subTotal = subtractMany([balance, tax, discount]);

// 		return {
// 			...order,
// 			discountRate: JSON.stringify(toSnapshot(discountRate)),
// 			taxRate: JSON.stringify(toSnapshot(taxRate)),
// 			balance: JSON.stringify(toSnapshot(balance)),
// 			subTotal: JSON.stringify(toSnapshot(subTotal)),
// 			isActive: true,
// 			discount: JSON.stringify(toSnapshot(discount)),
// 			tax: JSON.stringify(toSnapshot(tax)),
// 			orderLine: orderLine
// 		};
// 	} catch (err: any) {
// 		logger.error(`Error: ${err.message}`);

// 	}
// };


export const calculateOrder = async (reqOrder: any) => {

	try {
		const pricelist = await prisma.pricelists.findUnique({
			where: {
				id: reqOrder.pricelistsID
			},
			include: {
				PricelistSubList: true
			}
		})

		const asyncOrderline = reqOrder.orderLine.map(async (item: any) => {
			const { quantity = 1, embroideryTypes = 'flat' } = item
			const product = await prisma.products.findUnique({
				where: {
					id: item.productsID
				}
			})

			if (!product) {
				throw new Error(`Product id ${item.productID} does not exist`);
			}

			const { stitches } = product

			if (stitches && pricelist) {
				/**
				 * Calculate prices
				 */
				const { pricePerThousandStitches, minimumPrice } = getQuantityPricelist({
					pricelist,
					embroideryTypes,
					quantity
				});

				// convert to dinero units

				const dineroPrice = dinero(JSON.parse(pricePerThousandStitches));

				// calculate the unit price = stitches * pricePerThousandStitches

				const calcUnitPrice = multiply(dineroPrice, { amount: stitches, scale: 3 });

				// get the greatest of unit price or minimum price

				const largestUnitPrice = greaterThanOrEqual(dinero(JSON.parse(minimumPrice)), calcUnitPrice)
					? dinero(JSON.parse(minimumPrice))
					: calcUnitPrice;


				return {
					...item,
					unitPrice: toSnapshot(largestUnitPrice),
				};
			} else {

				return { ...item };
			}

		})

		const newOrderline = await Promise.all(asyncOrderline)

		return newOrderline

	} catch (err) {

	}

};
