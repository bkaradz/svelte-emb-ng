import { readable, writable } from 'svelte/store';
import { USD, BWP, ZAR } from '@dinero.js/currencies';
import { ZWB, ZWR } from '$lib/services/monetary';

export const currencyOptions = [
	{
		currency: 'USD',
		symbol: '$',
		dineroObj: USD
	},
	{
		currency: 'ZAR',
		symbol: 'R',
		dineroObj: ZAR
	},
	{
		currency: 'BWP',
		symbol: 'P',
		dineroObj: BWP
	},
	{
		currency: 'ZWB',
		symbol: '$',
		dineroObj: ZWB
	},
	{
		currency: 'ZWR',
		symbol: '$',
		dineroObj: ZWR
	}
];

export const getCurrencyOptions = () => {
	return currencyOptions
}

export type CurrenciesOptionsType = typeof currencyOptions;
export type CurrencyOption = CurrenciesOptionsType[0];

export const selectedCurrency = writable(currencyOptions[0]);

export const currenciesOptions = readable(currencyOptions);
