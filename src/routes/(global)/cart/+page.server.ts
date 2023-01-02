import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types'

export const load = (async ({ params }) => {

  const embroideryTypesPromise = await prisma.options.findMany({
    where: {
      isActive: true,
      group: 'embroideryTypes'
    },
  })
  const embroideryPositionsPromise = await prisma.options.findMany({
    where: {
      isActive: true,
      group: 'embroideryPositions'
    },
  })
  const pricelistsPromise = await prisma.pricelists.findMany({
    where: {
      isActive: true,
    },
    include: {
      PricelistDetails: true
    }
  })

  const customersPromise = await prisma.contacts.findMany({
    take: 7,
    skip: 0,
    where: {
      isActive: true,
    },
    include: {
      email: true,
      phone: true,
      address: true
    },
    orderBy: {
      name: 'asc'
    },
  })

  const [embroideryTypes, embroideryPositions, customers, pricelists] = await Promise.all([
    embroideryTypesPromise,
    embroideryPositionsPromise,
    customersPromise,
    pricelistsPromise
  ]);

  const defaultPricelist = pricelists.find(
    (list: { isDefault: boolean }) => list.isDefault === true
  );

  let defaultPricelistId

  if (defaultPricelist) {
    defaultPricelistId = defaultPricelist.id;
  }

  const newCustomers = { results: customers }

  return {
    embroideryTypes,
    embroideryPositions,
    customers: newCustomers,
    pricelists,
    defaultPricelistId
  };

}) satisfies PageServerLoad;