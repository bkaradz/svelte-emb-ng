import type { OrderLine, Products } from '@prisma/client';
import dayjs from 'dayjs';
import { writable } from 'svelte/store';

function addCartItems() {
  const { subscribe, set, update } = writable<Map<number, OrderLine>>(new Map<number, OrderLine>());

  return {
    subscribe,
    add: (product: Partial<OrderLine>) => update((products) => products.set(product.id, {
      ...product, quantity: 1, embroideryPositions: 'frontLeft', embroideryTypes: 'flat',
      productsID: product.id
    })),
    update: (product: Partial<OrderLine> , payload: Partial<OrderLine>) => update((products) => products.set(product.id, { ...product, ...payload })),
    remove: (product: Partial<OrderLine> ) => update((products) => {
      products.delete(product.id)
      return products
    }),
    reset: () => set(new Map<number, OrderLine>())
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