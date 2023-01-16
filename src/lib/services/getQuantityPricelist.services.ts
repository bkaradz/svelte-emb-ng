import logger from '$lib/utility/logger';
import type { PricelistDetails, Pricelists } from '@prisma/client';

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
			throw new Error('Pricelist Selection is Undefined');
		}

		return minimumQuantityArray;
	} catch (err: unknown) {
		logger.error(`Error: ${err}`);
		throw new Error(`Error: ${err}`);
	}
};
