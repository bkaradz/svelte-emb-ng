import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';


export const load = (async (event) => {
  const users = await router.createCaller(await createContext(event)).authentication.getUsers({});

  return {
    users: users.results
  };
}) satisfies PageServerLoad;