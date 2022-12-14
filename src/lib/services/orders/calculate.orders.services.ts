import {
	dinero,
	greaterThanOrEqual,
	multiply,
	toSnapshot,
} from 'dinero.js';
import logger from '$lib/utility/logger';
import { getQuantityPricelist } from '$lib/services/getQuantityPricelist.services';
import prisma from '$lib/prisma/client';

export const calculateOrder = async (reqOrder: any) => {
	try {
		/**
		 * Get Pricelist
		 */
		const pricelist = await prisma.pricelists.findUnique({
			where: {
				id: parseInt(reqOrder.pricelistsID)
			},
			include: {
				PricelistDetails: true
			}
		});

		if (!pricelist) {
			throw new Error("Pricelist not found");
		}

		const asyncOrderLine = reqOrder.orderLine.map(async (item: any) => {
			const { quantity = 1, embroideryTypes = 'flat' } = item;
			/**
			 * Get product
			 */
			const product = await prisma.products.findUnique({
				where: {
					id: parseInt(item?.id)
				}
			});

			if (!product) {
				throw new Error(`Product id ${item?.id} does not exist`);
			}

			const { stitches } = product;

			if (stitches && pricelist) {
				/**
				 * Get appropriate pricePerThousandStitches & minimumPrice given the pricelist, quantity & embroideryTypes
				 */
				const { pricePerThousandStitches, minimumPrice } = getQuantityPricelist({
					pricelist,
					embroideryTypes,
					quantity
				});

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
				return { ...item };
			}
		});

		const newOrderLine = await Promise.all(asyncOrderLine);

		return newOrderLine;
	} catch (err: any) {
		logger.error(`Error: ${err}`);
		throw new Error(`Error:  ${err?.message}`);
	}
};
