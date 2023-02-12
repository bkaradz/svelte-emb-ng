import type { PageServerLoad } from './$types'
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

  const orders = async () => {
    return await router.createCaller(await createContext(event)).orders.getOrders({});
  }

  return {
    orders: orders(),
  };

}) satisfies PageServerLoad;