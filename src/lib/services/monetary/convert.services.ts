import { dinero, convert, toSnapshot, toUnit  } from 'dinero.js';
import { USD, ZAR } from '@dinero.js/currencies';
import logger from '$lib/utility/logger';
import type { Currency, Dinero, DineroOptions } from 'dinero.js';

export const BOND: Currency<number> = {
	code: 'BOND',
	base: 10,
	exponent: 2
};

export const RTGS: Currency<number> = {
	code: 'RTGS',
	base: 10,
	exponent: 2
};

function converter(
	dineroObject: Dinero<unknown>,
	newCurrency: { code: string; base: number; exponent: number }
) {
	if (newCurrency === ZAR) {
		return convert(dineroObject, newCurrency, { ZAR: { amount: 1600, scale: 2 } });
	}
	if (newCurrency === BOND) {
		return convert(dineroObject, newCurrency, { BOND: { amount: 40000, scale: 2 } });
	}
	if (newCurrency === RTGS) {
		return convert(dineroObject, newCurrency, { RTGS: { amount: 51000, scale: 2 } });
	}
	if (newCurrency === USD) {
		return convert(dineroObject, newCurrency, { USD: { amount: 100, scale: 2 } });
	}
}

export function createConverter({ code }) {
	return code === 'USD' ? (x: Dinero<unknown>) => x : converter;
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
		} catch (err: any) {
			logger.error(`Error: ${err.message}`);
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
