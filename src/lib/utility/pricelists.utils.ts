import type { PricelistDetails, Pricelists } from '@prisma/client';
import { dinero, toFormat, type DineroOptions } from 'dinero.js';

export function formatDefault(dineroObject: DineroOptions<number>) {
	return toFormat(
		dinero(dineroObject),
		({ amount, currency }) => `${currency.code} $${amount.toFixed(3)}`
	);
}

type Pricelist = Pricelists & { PricelistDetails: PricelistDetails[] };

export const convertPricelist = (subPricelist: Pricelist) => {
	const pricelists = subPricelist.PricelistDetails.map((list: any) => {
		return {
			...list,
			pricePerThousandStitches: formatDefault(JSON.parse(list.pricePerThousandStitches)),
			minimumPrice: formatDefault(JSON.parse(list.minimumPrice))
		};
	});
	subPricelist.PricelistDetails = pricelists;
	return subPricelist;
};
