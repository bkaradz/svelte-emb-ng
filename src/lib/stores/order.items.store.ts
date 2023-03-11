import { writable } from 'svelte/store';

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
		add: (item: any) => {
			if (!orderItemsIDs.has(item.id)) {
				orderItemsIDs.add(item.id);
				update((allOrderItems: any[]) => [...allOrderItems, { ...item, ...lineItems }]);
			}
		},
		remove: (id: Schema.Types.ObjectId) => {
			orderItemsIDs.delete(id);
			update((allOrderItems: any[]) => allOrderItems.filter((item: any) => item.id !== id));
		},
		update: (item: any) => {
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
