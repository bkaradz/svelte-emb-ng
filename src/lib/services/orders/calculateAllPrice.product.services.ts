import { getQuantityPricelist } from '$lib/services/getQuantityPricelist.services';
import logger from '$lib/utility/logger';
import type { PricelistDetails, Pricelists, Products } from '@prisma/client';
import { dinero, greaterThanOrEqual, multiply } from 'dinero.js';
import { format } from '../monetary';
import { error } from '@sveltejs/kit';

type NewPricelists = Pricelists & { PricelistDetails: PricelistDetails[] };

export const calculateProductPrices = (
	product: Products,
	pricelist: NewPricelists,
	embroideryTypes = 'flat'
) => {
	try {
		if (!product) {
			// return;
			throw error(404,`Product does not exist`);
		}
		if (!pricelist) {
			// return;
			throw error(404,`Pricelist does not exist`);
		}
		if (product.productCategories !== 'embroidery') {
			/**
			 * TODO: Calculate the Prices when its not embroidery
			 */
			return;
		}

		const { stitches } = product;

		if (stitches && pricelist && embroideryTypes) {
			/**
			 * Get appropriate pricePerThousandStitches & minimumPrice given the pricelist, quantity & embroideryTypes
			 */
			const quantity = pricelist.PricelistDetails.filter(
				(item) => item.embroideryTypes === embroideryTypes
			).map((item) => item.minimumQuantity);

			return quantity.map((quantity) => {
				const { pricePerThousandStitches, minimumPrice } = getQuantityPricelist({
					pricelist,
					embroideryTypes,
					quantity
				}) as unknown as { pricePerThousandStitches: string; minimumPrice: string };

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
					[quantity]: format(largestUnitPrice)
				};
			});
		}

		throw error(404,'Something went wrong');
	} catch (err: any) {
		logger.error(`Error: ${err}`);
		throw error(500,`Error:  ${err?.message}`);
	}
};
