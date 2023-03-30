import { BWP, type Currency } from '@dinero.js/currencies';
import { dinero, haveSameCurrency, toFormat, toSnapshot, type Dinero } from 'dinero.js';
import { ZWB, ZWR } from './convert.services';
import logger from '$lib/utility/logger';

function intlFormat(locale: string, options = {}) {
	return function formatter(dineroObject: Dinero<number>) {
		function transformer({ amount, currency }: { amount: number; currency: Currency<number> }) {
			return amount.toLocaleString(locale, {
				...options,
				style: 'currency',
				currency: currency.code
			});
		}
		return toFormat(dineroObject, transformer);
	};
}

function formatDefault(dineroObject: Dinero<number>) {
	if (haveSameCurrency([dineroObject, dinero({ amount: 100, currency: ZWB })])) {
		return toFormat(
			dineroObject,
			({ amount }) => `ZB$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ')}`
		);
	}
	if (haveSameCurrency([dineroObject, dinero({ amount: 100, currency: ZWR })])) {
		return toFormat(
			dineroObject,
			({ amount }) => `ZR$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ')}`
		);
	}
	if (haveSameCurrency([dineroObject, dinero({ amount: 100, currency: BWP })])) {
		return toFormat(
			dineroObject,
			({ amount }) => `P${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ')}`
		);
	}
}

const formattersMap = new Map([
	['USD', intlFormat('en-US')],
	['ZAR', intlFormat('en-ZA')],
	['EUR', intlFormat('fr-FR')]
]);

// const formatters = {
// 	USD: intlFormat('en-US'),
// 	ZAR: intlFormat('en-ZA'),
// 	EUR: intlFormat('fr-FR')
// };

export function format(dineroObject: Dinero<number> | undefined) {
	try {
		if (!dineroObject) {
			throw new Error('Dinero object can not be undefined');
		}

		const { currency } = toSnapshot(dineroObject);
		// const formatFn = formatters[currency.code] || formatDefault;
		const formatFn = formattersMap.get(currency.code) || formatDefault;

		return formatFn(dineroObject);
	} catch (err) {
		logger.info(`Error: ${err}`);
	}
}
