import dayjs from 'dayjs';
import { writable } from 'svelte/store';

function addCartItems() {
  const { subscribe, set, update } = writable<Map<number, unknown>>(new Map<number, unknown>());

  return {
    subscribe,
    add: (product) => update((products) => products.set(product.id, {
      ...product, quantity: 1, embroideryPositions: 'frontLeft', embroideryTypes: 'flat',
      productsID: product.id
    })),
    update: (product, payload) => update((products) => products.set(product.id, { ...product, ...payload })),
    remove: (product) => update((products) => {
      products.delete(product.id)
      return products
    }),
    reset: () => set(new Map<number, unknown>())
  };
}

export const cartItem = addCartItems();

const today = dayjs('2019-01-25').format('YYYY-MM-DDTHH:mm');

function addCart() {

  const order = {
    id: null,
		customersID: null,
		pricelistsID: 0,
		isActive: true,
		accountsStatus: null,
		orderDate: today,
  }

  const { subscribe, set, update } = writable(order);

  return {
    subscribe,
    add: (order) => set(order),
    update: (product, payload) => set({...product, ...payload}),
    reset: () => set(order)
  };
}

export const cartOrder = addCart();