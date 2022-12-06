import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const embroideryTypesPromise = await prisma.options.findMany({
    where: {
      isActive: true,
      group: 'embroideryTypes'
    },
  })

  const [embroideryTypes] = await Promise.all([embroideryTypesPromise]);

  return {
    embroideryTypes,
  };
};