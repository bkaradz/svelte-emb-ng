import { writable } from 'svelte/store';

// let order: OrdersDocument = {
// 	subTotal: '{"amount":0,"currency":{"code":"USD","base":10,"exponent":2},"scale":3}',
// 	tax: '{"amount":0,"currency":{"code":"USD","base":10,"exponent":2},"scale":3}',
// 	taxRate: '',
// 	discount: '{"amount":0,"currency":{"code":"USD","base":10,"exponent":2},"scale":3}',
// 	discountRate: '',
// 	balance: '{"amount":0,"currency":{"code":"USD","base":10,"exponent":2},"scale":3}',
// 	isActive: true,
// 	pricelistID: [],
// 	customerID: [],
// 	OrderLine: []
// };

export const orderStore = writable(null);

