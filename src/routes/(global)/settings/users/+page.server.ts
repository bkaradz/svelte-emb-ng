import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';


export const load = (async (event) => {
  const users = async () => {
    return await router.createCaller(await createContext(event)).authentication.getUsers({});
  }

  return {
    users: users()
  };
}) satisfies PageServerLoad;