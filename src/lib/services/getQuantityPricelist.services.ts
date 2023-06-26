import logger from '$lib/utility/logger';
import type { PricelistDetails, Pricelists } from '@prisma/client';
import { error } from '@sveltejs/kit';

export const getQuantityPricelist = ({
	pricelist,
	embroideryTypes,
	quantity
}: {
	pricelist: Pricelists & { PricelistDetails: PricelistDetails[] };
	embroideryTypes: string;
	quantity: number;
}) => {
	try {
		const pricelistsArray = pricelist?.PricelistDetails;

		const minimumQuantityArray = pricelistsArray
			.filter((list) => embroideryTypes.toLowerCase() === list.embroideryTypes.toLowerCase())
			.sort((a, b) => b.minimumQuantity - a.minimumQuantity)
			.filter((list) => list.minimumQuantity >= quantity)
			.pop();

		if (minimumQuantityArray === undefined) {
			throw error(404, 'Pricelist Selection is Undefined');
		}

		return minimumQuantityArray;
	} catch (err: unknown) {
		logger.error(`Error: ${err}`);
		throw error(500, `Error: ${err}`);
	}
};
