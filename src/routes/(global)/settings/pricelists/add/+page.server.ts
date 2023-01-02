import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {
  const embroideryTypes = await router.createCaller(await createContext(event)).options.getOptions({ group: 'embroideryTypes' })

  // const embroideryTypesPromise = await prisma.options.findMany({
  //   where: {
  //     isActive: true,
  //     group: 'embroideryTypes'
  //   },
  // })

  // const [embroideryTypes] = await Promise.all([embroideryTypesPromise]);

  return {
    embroideryTypes,
  };
}) satisfies PageServerLoad;