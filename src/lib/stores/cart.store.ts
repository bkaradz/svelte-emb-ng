import type { SaveOrder, SaveOrdersLine } from '$lib/validation/saveOrder.validate';
import { writable } from 'svelte/store';

function addCartItems() {
	const { subscribe, set, update } = writable<Map<number, SaveOrdersLine>>(
		new Map<number, SaveOrdersLine>()
	);

	return {
		subscribe,
		add: (
			payload: Omit<SaveOrdersLine, 'embroideryTypes' | 'id'> & {
				embroideryTypes?: string | undefined | null;
				id: number;
			}
		) =>
			update((cart) =>
				cart.set(payload.id, {
					...payload,
					quantity: 1,
					embroideryPositions: 'frontLeft',
					embroideryTypes: 'flat',
					productsID: payload.id
				})
			),
		update: (orderLine: SaveOrdersLine, payload: Partial<SaveOrdersLine>) =>
			update((cart) => cart.set(orderLine.id!, { ...orderLine, ...payload })),
		remove: (id: number) =>
			update((cart) => {
				cart.delete(id);
				return cart;
			}),
		reset: () => set(new Map<number, SaveOrdersLine>())
	};
}

export const cartItem = addCartItems();

function addCartOrders() {
	const order: Partial<Omit<SaveOrder, 'OrderLine'>> = {};

	const { subscribe, set } = writable(order);

	return {
		subscribe,
		add: (order: Omit<SaveOrder, 'OrderLine'>) => set(order),
		update: (
			order: Omit<SaveOrder, 'OrderLine'>,
			payload: Partial<Omit<SaveOrder, 'OrderLine'>>
		) => {
			set({ ...order, ...payload });
		},
		reset: () => set(order)
	};
}

export const cartOrder = addCartOrders();
