import type { SaveOrder, SaveOrdersLine } from '$lib/validation/saveOrder.validate';
import dayjs from 'dayjs';
import { writable } from 'svelte/store';


function addCartItems() {
	const { subscribe, set, update } = writable<Map<number, Partial<SaveOrdersLine>>>(
		new Map<number, Partial<SaveOrdersLine>>()
	);

	return {
		subscribe,
		add: (product: SaveOrdersLine) =>
			update((products) =>
				products.set(product.id, {
					...product,
					quantity: 1,
					embroideryPositions: 'frontLeft',
					embroideryTypes: 'flat',
					productsID: product.id
				})
			),
		update: (product: SaveOrdersLine, payload: Partial<SaveOrdersLine>) =>
			update((products) => products.set(product.id, { ...product, ...payload })),
		remove: (product: SaveOrdersLine) =>
			update((products) => {
				products.delete(product.id);
				return products;
			}),
		reset: () => set(new Map<number, Partial<SaveOrdersLine>>())
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
		add: (order: SaveOrder) => set(order),
		update: (product, payload) => {
			set({ ...product, ...payload });
		},
		reset: () => set(order)
	};
}

export const cartOrder = addCartOrders();
