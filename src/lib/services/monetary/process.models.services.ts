import { toSnapshot, type Dinero } from 'dinero.js';
import { toDineroObject, toObject } from './convert.services';

// export function getMonetaryValue(value: string) {
//   if (typeof value !== 'undefined') {
//     return parseFloat(value.toString())
//   }
//   return value
// }

export function getMonetaryValue(value: string) {
	if (typeof value !== 'undefined') {
		return toDineroObject(JSON.parse(value));
	}
	return value;
}

export function setMonetaryValue(value: number | string | Dinero<number>): string {
	if (typeof value === 'number' || typeof value === 'string') {
		const dineroObject = toDineroObject(value);

		const jsonObject = JSON.stringify(toSnapshot(dineroObject));

		return jsonObject;
	}
	if (typeof value === 'object') {
		return JSON.stringify(toObject(value));
	}
}

export function defaultMonetaryValue(): string {
	return JSON.stringify(toDineroObject(0).toJSON());
}
