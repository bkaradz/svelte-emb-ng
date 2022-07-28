import type { PricelistsSubDocument } from '$lib/models/pricelists.model';
import { dinero, toFormat, type DineroOptions } from 'dinero.js';

export function formatDefault(dineroObject: DineroOptions<number>) {
	return toFormat(
		dinero(dineroObject),
		({ amount, currency }) => `${currency.code} $${amount.toFixed(3)}`
	);
}

export const convertPricelist = (subPricelist) => {
	const pricelists = subPricelist.pricelists.map((list: any): PricelistsSubDocument => {
		return {
			...list,
			pricePerThousandStitches: formatDefault(JSON.parse(list.pricePerThousandStitches)),
			minimumPrice: formatDefault(JSON.parse(list.minimumPrice))
		};
	});
	subPricelist.pricelists = pricelists;
	return subPricelist;
};
