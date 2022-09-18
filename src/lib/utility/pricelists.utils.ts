import { dinero, toFormat, type DineroOptions } from 'dinero.js';

export function formatDefault(dineroObject: DineroOptions<number>) {
	return toFormat(
		dinero(dineroObject),
		({ amount, currency }) => `${currency.code} $${amount.toFixed(3)}`
	);
}

export const convertPricelist = (subPricelist) => {
	const pricelists = subPricelist.PricelistSubList.map((list: any) => {
		return {
			...list,
			pricePerThousandStitches: formatDefault(JSON.parse(list.pricePerThousandStitches)),
			minimumPrice: formatDefault(JSON.parse(list.minimumPrice))
		};
	});
	subPricelist.PricelistSubList = pricelists;
	return subPricelist;
};
