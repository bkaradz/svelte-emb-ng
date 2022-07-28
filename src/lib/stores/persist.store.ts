import { writable } from 'svelte/store';


export const persistStore = <T>(key: string, initial: T): T => {
	const persist = localStorage.getItem(key);

	const data: T = persist ? JSON.parse(persist) : initial;

	const store = writable(data, () => {
		const unsubscribe = store.subscribe((value) => {
			localStorage.setItem(key, JSON.stringify(value));
		});
		return unsubscribe;
	});
	return store;
};
