import { writable } from 'svelte/store';


function addCartItems() {
  const { subscribe, set, update } = writable<Set<number>>(new Set<number>());

  return {
    subscribe,
    add: (productId: number) => update((productIds) => productIds.add(productId)),
    remove: (productId: number) => update((productIds) => {
      productIds.delete(productId)
      return productIds
    }),
    reset: () => set(new Set<number>())
  };
}

export const cartItem = addCartItems();