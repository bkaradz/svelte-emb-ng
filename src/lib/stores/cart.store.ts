import type { OrderLine, Orders, Products } from '@prisma/client';
import dayjs from 'dayjs';
import { writable } from 'svelte/store';

type NewOrderLine = OrderLine & Products;

function addCartItems() {
	const { subscribe, set, update } = writable<Map<number, Partial<NewOrderLine>>>(
		new Map<number, Partial<NewOrderLine>>()
	);

	return {
		subscribe,
		add: (product: NewOrderLine) =>
			update((products) =>
				products.set(product.id, {
					...product,
					quantity: 1,
					embroideryPositions: 'frontLeft',
					embroideryTypes: 'flat',
					productsID: product.id
				})
			),
		update: (product: NewOrderLine, payload: Partial<NewOrderLine>) =>
			update((products) => products.set(product.id, { ...product, ...payload })),
		remove: (product: NewOrderLine) =>
			update((products) => {
				products.delete(product.id);
				return products;
			}),
		reset: () => set(new Map<number, Partial<NewOrderLine>>())
	};
}

export const cartItem = addCartItems();

const today = dayjs('2019-01-25').format('YYYY-MM-DDTHH:mm');

function addCartOrders() {
	const order = {
		id: null,
		customersID: null,
		pricelistsID: 0,
		isActive: true,
		accountsStatus: null,
		orderDate: today
	};

	const { subscribe, set, update } = writable(order);

	return {
		subscribe,
		add: (order: Orders) => set(order),
		update: (product, payload) => {
			set({ ...product, ...payload });
		},
		reset: () => set(order)
	};
}

export const cartOrder = addCartOrders();
