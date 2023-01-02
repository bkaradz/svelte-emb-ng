import type { PageServerLoad } from './$types'
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

  const products = await router.createCaller(await createContext(event)).products.getProducts({});

  return {
    products
  };

}) satisfies PageServerLoad;