import type { OrderLineDocument } from '$lib/models/orders.model';
import type { Schema } from 'mongoose';
import { writable } from 'svelte/store';

type orderItemsInterface = OrderLineDocument;

const orderItemsIDs = new Set([]);

const lineItems = {
	total: '',
	productCategories: '',
	embroideryTypes: '',
	embroideryPositions: '',
	manufacturingStatus: ''
};

function createOrderItems() {
	const { subscribe, set, update } = writable([]);

	return {
		subscribe,
		add: (item: orderItemsInterface) => {
			if (!orderItemsIDs.has(item.id)) {
				orderItemsIDs.add(item.id);
				update((allOrderItems: orderItemsInterface[]) => [
					...allOrderItems,
					{ ...item, ...lineItems }
				]);
			}
		},
		remove: (id: Schema.Types.ObjectId) => {
			orderItemsIDs.delete(id);
			update((allOrderItems: orderItemsInterface[]) =>
				allOrderItems.filter((item: orderItemsInterface) => item.id !== id)
			);
		},
		update: (item: orderItemsInterface) => {
			this.remove(item.id);
			this.add(item);
		},
		reset: () => {
			orderItemsIDs.clear();
			set([]);
		},
		orderItemsHasID: (id: Schema.Types.ObjectId) => {
			return orderItemsIDs.has(id);
		}
	};
}

export const orderItems = createOrderItems();
