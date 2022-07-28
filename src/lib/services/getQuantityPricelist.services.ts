import type { PricelistsDocument } from "$lib/models/pricelists.model";
import logger from '$lib/utility/logger';

export const getQuantityPricelist = ({
	pricelist,
	embroideryTypes,
	quantity
}: {
	pricelist: PricelistsDocument;
	embroideryTypes: string;
	quantity: number;
}) => {
	try {
		// const pricelist = await PricelistsModel.findById({ _id: id }).lean();
		const pricelistsArray = pricelist.pricelists;

		const minimumQuantityArray = pricelistsArray
			.filter((list) => embroideryTypes === list.embroideryTypes)
			.sort((a, b) => a.minimumQuantity - b.minimumQuantity)
			.filter((list) => list.minimumQuantity <= quantity);

		return minimumQuantityArray.pop();
	} catch (err) {
		logger.error(`Error ${err.message}`);
		throw new Error(`Error ${err.message}`);
	}
};