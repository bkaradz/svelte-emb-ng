import { dinero, convert, toSnapshot, toUnit } from 'dinero.js';
import { USD, ZAR, BWP } from '@dinero.js/currencies';
import logger from '$lib/utility/logger';
import type { Currency, Dinero, DineroOptions } from 'dinero.js';
import type { XchangeRate, XchangeRateDetails } from '@prisma/client';
import { browser } from '$app/environment';

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

function converter(dineroObject: Dinero<number>, newCurrency: Currency<number>) {
	// getCurrentCurrencies();
	if (!currenciesRates) {
		return;
	}
	if (newCurrency === ZAR) {
		const amount = currenciesRates.get(newCurrency.code);
		if (!amount) {
			return;
		}
		return convert(dineroObject, newCurrency, { ZAR: { amount, scale: 2 } });
	}
	if (newCurrency === BWP) {
		const amount = currenciesRates.get(newCurrency.code);
		if (!amount) {
			return;
		}
		return convert(dineroObject, newCurrency, { BWP: { amount, scale: 2 } });
	}
	if (newCurrency === ZWB) {
		const amount = currenciesRates.get(newCurrency.code);
		if (!amount) {
			return;
		}
		return convert(dineroObject, newCurrency, { ZWB: { amount, scale: 2 } });
	}
	if (newCurrency === ZWR) {
		const amount = currenciesRates.get(newCurrency.code);
		if (!amount) {
			return;
		}
		return convert(dineroObject, newCurrency, { ZWR: { amount, scale: 2 } });
	}
	if (newCurrency === USD) {
		const amount = currenciesRates.get(newCurrency.code);
		if (!amount) {
			return;
		}
		return convert(dineroObject, newCurrency, { USD: { amount, scale: 2 } });
	}
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

export function getAmount(dineroObject: Dinero<unknown>): number {
	return toUnit(dineroObject);
}

if (browser) {
	(async () => {
		const paramsObj: unknown = { isDefault: true };
		try {
			const searchParams = new URLSearchParams(paramsObj as string);
			const res = await fetch('/api/rates.json?' + searchParams.toString());
			if (res.ok) {
				type Rates = Partial<XchangeRate> & { XchangeRateDetails: XchangeRateDetails[] };
				const rates: Rates[] = await res.json();
				const ratesMap = new Map();
				rates[0]?.XchangeRateDetails.map((rate) => {
					if (!(typeof rate.rate === 'string')) {
						return;
					}
					ratesMap.set(rate.currency, parseInt(rate.rate) * 100);
				});
				currenciesRates = ratesMap;
			}
		} catch (err: unknown) {
			logger.error(`Error: ${err}`);
		}
	})();
}
