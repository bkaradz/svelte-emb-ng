import logger from '$lib/utility/logger';

export const getQuantityPricelist = ({
	pricelist,
	embroideryTypes,
	quantity
}: {
	pricelist: any
	embroideryTypes: string;
	quantity: number;
}) => {
	try {
		const pricelistsArray = pricelist?.PricelistSubList;

		const minimumQuantityArray = pricelistsArray
			.filter((list) => embroideryTypes.toLowerCase() === list.embroideryTypes.toLowerCase())
			.sort((a, b) => b.minimumQuantity - a.minimumQuantity)
			.filter((list) => list.minimumQuantity >= quantity)
			.pop()

		if (minimumQuantityArray === undefined) {
			throw new Error("Pricelist Selection is Undefined");
		}

		return minimumQuantityArray;
	} catch (err: any) {
		logger.error(`Error ${err.message}`);
		throw new Error(`Error ${err.message}`);
	}
};