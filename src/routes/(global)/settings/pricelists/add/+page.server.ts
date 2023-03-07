import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
  const embroideryTypes = async () => {
    return await router.createCaller(await createContext(event)).options.getOptions({ group: 'embroideryTypes' })
  }

  return {
    embroideryTypes: embroideryTypes(),
  };
}) satisfies PageServerLoad;