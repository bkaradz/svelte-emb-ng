import { writable } from 'svelte/store';


function addCartItems() {
    const { subscribe, set, update } = writable(new Map());

    return {
        subscribe,
        add: (product) => update((products) => products.set(product.id, {
            ...product, quantity: 1, embroideryPositions: 'frontLeft', embroideryTypes: 'flat',
            productsID: product.id
        })
        ),
        update: (product, payload) => update((products) => products.set(product.id, { ...product, ...payload })),
        remove: (product) => update((products) => {
            products.delete(product.id)
            return products
        }),
        reset: () => set(new Map())
    };
}

export const cartItem = addCartItems();