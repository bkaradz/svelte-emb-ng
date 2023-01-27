import { dinero, convert, toSnapshot, type Rates } from 'dinero.js';
import { USD, ZAR, BWP } from '@dinero.js/currencies';
import logger from '$lib/utility/logger';
import type { Currency, Dinero, DineroOptions } from 'dinero.js';
import { browser } from '$app/environment';
import { trpc } from '$lib/trpc/client';
import { handleErrors } from '$lib/utility/errorsHandling';

export const ZWB: Currency<number> = {
	code: 'ZWB',
	base: 10,
	exponent: 2
};

export const ZWR: Currency<number> = {
	code: 'ZWR',
	base: 10,
	exponent: 2
};

let currenciesRates: Map<string, number>;

const getRates = (newCurrency: Currency<number>): Rates<number> | undefined => {
	let rates = undefined

	if (newCurrency === ZAR) {
		const amount = currenciesRates.get(newCurrency.code);
		if (!amount) {
			return;
		}
		rates = { ZAR: { amount, scale: 2 } };
	}
	if (newCurrency === BWP) {
		const amount = currenciesRates.get(newCurrency.code);
		if (!amount) {
			return;
		}
		rates = { BWP: { amount, scale: 2 } };
	}
	if (newCurrency === ZWB) {
		const amount = currenciesRates.get(newCurrency.code);
		if (!amount) {
			return;
		}
		rates = { ZWB: { amount, scale: 2 } };
	}
	if (newCurrency === ZWR) {
		const amount = currenciesRates.get(newCurrency.code);
		if (!amount) {
			return;
		}
		rates = { ZWR: { amount, scale: 2 } };
	}
	if (newCurrency === USD) {
		const amount = currenciesRates.get(newCurrency.code);
		if (!amount) {
			return;
		}
		rates = { USD: { amount, scale: 2 } };
	}

	if (!rates) {
		return
	}

	return rates
}
const getUSDRates = (newCurrency: Currency<number>): Rates<number> | undefined => {

	const amount = currenciesRates.get(newCurrency.code);
	if (!amount) {
		return;
	}
	const rates = { USD: { amount: parseInt(Math.ceil((100 * 100 * 1000)) / (amount)), scale: 5 } };

	if (!rates) {
		return
	}

	return rates
}

function converter(dineroObject: Dinero<number>, newCurrency: Currency<number>) {

	if (!currenciesRates) {
		return;
	}

	const rates = getRates(newCurrency)

	if (!rates) {
		return
	}

	return convert(dineroObject, newCurrency, rates)
}

export function createConverter({ code }: { code: Currency<number>['code'] }) {
	return code === 'USD' ? (x: Dinero<number>) => x : converter;
}

export function toDineroObject(amount: number | string | DineroOptions<number>) {
	if (typeof amount === 'number') {
		const temp = amount * 1000;
		return dinero({ amount: temp, currency: USD, scale: 3 });
	}
	if (typeof amount === 'string') {
		// if string is a stringified dinero object
		try {
			const results = JSON.parse(amount);
			return dinero(results);
		} catch (err: unknown) {
			logger.error(`Error: ${err}`);
		}
		const temp = +amount * 1000;
		return dinero({ amount: temp, currency: USD, scale: 3 });
	}
	return dinero(amount);
}

export function toObject(dineroObject: Dinero<number>): {
	amount: number;
	currency: { code: string; base: number; exponent: number };
	scale: number;
} {
	return toSnapshot(dineroObject);
}




export function createConverterHOF() {
	return function converter(dineroObject: Dinero<number>, newCurrency: Currency<number>, selectedCurrency: {
		currency: string;
		symbol: string;
		dineroObj: Currency<number>
	}) {

		if (!currenciesRates) {
			return;
		}

		const rates = getUSDRates(selectedCurrency.dineroObj)

		if (!rates) {
			return
		}

		return convert(dineroObject, newCurrency, rates);
	};
}


if (browser) {
	(async () => {
		// const paramsObj: unknown = { isDefault: true };
		try {
			const rates = await trpc().xchangeRate.getDefaultXchangeRate.query()

			if (rates.length === 1) {

				const ratesMap = new Map<string, number>();
				rates[0]?.XchangeRateDetails.map((rate) => {
					if (!(typeof parseInt(rate.rate) === 'number')) {
						return;
					}
					ratesMap.set(rate.currency, parseInt(Math.ceil(parseFloat(rate.rate) * 100)));
				});
				if (ratesMap.size === 0) {
					throw new Error("Exchange Rates not found");
				}
				currenciesRates = ratesMap;
			} else {
				throw new Error("Default Exchange Rates more than one found");
			}

		} catch (err: unknown) {
			handleErrors(err)
		}
	})();
}
