import { readable, writable } from 'svelte/store';
import { USD, BWP, ZAR, type Currency } from '@dinero.js/currencies';
import { ZWB, ZWR } from '$lib/services/monetary';

export type CurrencyType = 'USD' | 'ZAR' | 'BWP' | 'ZWB' | 'ZWR'
export type SymbolType = '$' | 'R' | 'P'
export type CurrencyOption = {
	currency: CurrencyType;
	symbol: SymbolType;
	dineroObj: Currency<number>
}

const currencyOptions = new Map<CurrencyType, CurrencyOption>(
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

export const selectedCurrency = writable(currencyOptions.get('USD'));

export const currenciesOptions = readable(currencyOptions);
