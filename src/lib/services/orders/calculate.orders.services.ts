import prisma from '$lib/prisma/client';
import { getQuantityPricelist } from '$lib/services/getQuantityPricelist.services';
import logger from '$lib/utility/logger';
import type { SaveOrder } from '$lib/validation/saveOrder.validate';
import { error } from '@sveltejs/kit';
import { dinero, greaterThanOrEqual, multiply, toSnapshot } from 'dinero.js';

export const calculateOrder = async (reqOrder: Partial<SaveOrder>) => {
	try {
		/**
		 * Get Pricelist
		 */
		const pricelist = await prisma.pricelists.findUnique({
			where: {
				id: reqOrder.pricelistsID
			},
			include: {
				PricelistDetails: true
			}
		});

		if (!pricelist) {
			throw error(404, 'Pricelist not found');
		}

		if (!Array.isArray(reqOrder.OrderLine)) {
			throw error(404, 'OrderLine array not found');
		}

		if (reqOrder.OrderLine.length < 1) {
			throw error(404, 'Order does not have an OrderLine array');
		}

		const asyncOrderLine = reqOrder.OrderLine.map(async (item) => {
			const { quantity = 1, embroideryTypes = 'flat' } = item;
			/**
			 * Get product
			 */
			const product = await prisma.products.findUnique({
				where: {
					id: item?.productsID
				}
			});

			if (!product) {
				throw error(404, `Product does not exist`);
			}

			const { stitches } = product;

			if (stitches && pricelist && embroideryTypes) {
				/**
				 * Get appropriate pricePerThousandStitches & minimumPrice given the pricelist, quantity & embroideryTypes
				 */
				const { pricePerThousandStitches, minimumPrice } = getQuantityPricelist({
					pricelist,
					embroideryTypes,
					quantity
				}) as { pricePerThousandStitches: string; minimumPrice: string };

				/**
				 *  convert to dinero units
				 */

				const dineroPrice = dinero(JSON.parse(pricePerThousandStitches));

				/**
				 * calculate the unit price = stitches * pricePerThousandStitches
				 */
				const calcUnitPrice = multiply(dineroPrice, { amount: stitches, scale: 3 });

				/**
				 *  Get the greatest of unit price between Minimum Price & Calculated Price
				 */
				const largestUnitPrice = greaterThanOrEqual(dinero(JSON.parse(minimumPrice)), calcUnitPrice)
					? dinero(JSON.parse(minimumPrice))
					: calcUnitPrice;

				return {
					...item,
					unitPrice: toSnapshot(largestUnitPrice)
				};
			} else {
				return structuredClone(item);
			}
		});

		const newOrderLine = await Promise.all(asyncOrderLine);

		return newOrderLine;
	} catch (err: unknown) {
		logger.error(`Error: ${err}`);
		throw error(500, `Error:  ${err}`);
	}
};
