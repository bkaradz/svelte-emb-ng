import { readable, writable } from 'svelte/store';
import { USD, BWP, ZAR, type Currency } from '@dinero.js/currencies';
import { ZWB, ZWR } from '$lib/services/monetary';

type CurrencyType = 'USD' | 'ZAR' | 'BWP' | 'ZWB' | 'ZWR'
type SymbolType = '$' | 'R' | 'P'
type CurrencyObject = {
	currency: CurrencyType;
	symbol: SymbolType;
	dineroObj: Currency<number>
}

const currencyOptions = new Map<CurrencyType, CurrencyObject>(
	[
		[
			'USD',
			{
				currency: 'USD',
				symbol: '$',
				dineroObj: USD
			}
		],
		[
			'ZAR',
			{
				currency: 'ZAR',
				symbol: 'R',
				dineroObj: ZAR
			}
		],
		[
			'BWP',
			{
				currency: 'BWP',
				symbol: 'P',
				dineroObj: BWP
			}
		],
		[
			'ZWB',
			{
				currency: 'ZWB',
				symbol: '$',
				dineroObj: ZWB
			}
		],
		[
			'ZWR',
			{
				currency: 'ZWR',
				symbol: '$',
				dineroObj: ZWR
			}
		]
	]
)

// export const currencyOptions = [
// 	{
// 		currency: 'USD',
// 		symbol: '$',
// 		dineroObj: USD
// 	},
// 	{
// 		currency: 'ZAR',
// 		symbol: 'R',
// 		dineroObj: ZAR
// 	},
// 	{
// 		currency: 'BWP',
// 		symbol: 'P',
// 		dineroObj: BWP
// 	},
// 	{
// 		currency: 'ZWB',
// 		symbol: '$',
// 		dineroObj: ZWB
// 	},
// 	{
// 		currency: 'ZWR',
// 		symbol: '$',
// 		dineroObj: ZWR
// 	}
// ];

// export const getCurrencyOptions = () => {
// 	return currencyOptions
// }

// export type CurrenciesOptionsType = typeof currencyOptions;
// export type CurrencyOption = CurrenciesOptionsType[0];

export const selectedCurrency = writable(currencyOptions.get('USD'));

export const currenciesOptions = readable(currencyOptions);
