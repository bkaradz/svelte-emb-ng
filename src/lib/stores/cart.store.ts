import { writable } from 'svelte/store';

function addCartItems() {
  const { subscribe, set, update } = writable<Map<number, unknown>>(new Map<number, unknown>());

  return {
    subscribe,
    add: (product) => update((products) => products.set(product.id, {
      ...product, quantity: 1, total: {
        "scale": 3,
        "amount": 0,
        "currency": {
          "base": 10,
          "code": "USD",
          "exponent": 2
        }
      }, embroideryPositions: 'frontLeft', embroideryTypes: 'flat'
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