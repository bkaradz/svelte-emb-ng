import { BWP } from '@dinero.js/currencies';
import { dinero, haveSameCurrency, toFormat, toSnapshot, type Dinero } from 'dinero.js';
import { ZWB, ZWR } from './convert.services';

function intlFormat(locale: string, options = {}) {
	return function formatter(dineroObject: Dinero<unknown>) {
		function transformer({ amount, currency }) {
			return amount.toLocaleString(locale, {
				...options,
				style: 'currency',
				currency: currency.code
			});
		}
		return toFormat(dineroObject, transformer);
	};
}

function formatDefault(dineroObject: Dinero<unknown>) {
	if (haveSameCurrency([dineroObject, dinero({ amount: 100, currency: ZWB })])) {
		return toFormat(
			dineroObject,
			({ amount, currency }) => `ZB$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ')}`
		);
	}
	if (haveSameCurrency([dineroObject, dinero({ amount: 100, currency: ZWR })])) {
		return toFormat(
			dineroObject,
			({ amount, currency }) => `ZR$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ')}`
		);
	}
	if (haveSameCurrency([dineroObject, dinero({ amount: 100, currency: BWP })])) {
		return toFormat(
			dineroObject,
			({ amount, currency }) => `P${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ')}`
		);
	}
}

const formatters = {
	USD: intlFormat('en-US'),
	ZAR: intlFormat('en-ZA'),
	EUR: intlFormat('fr-FR')
};

export function format(dineroObject: Dinero<number>) {
	const { currency } = toSnapshot(dineroObject);
	const formatFn = formatters[currency.code] || formatDefault;

	return formatFn(dineroObject);
}
