import type { PageServerLoad } from './$types'
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';


export const load = (async (event) => {

  const embroideryTypes = await router.createCaller(await createContext(event)).options.getOptions({ group: 'embroideryTypes' })

  const embroideryPositions = await router.createCaller(await createContext(event)).options.getOptions({ group: 'embroideryPositions' })

  const currency = await router.createCaller(await createContext(event)).options.getOptions({ group: 'currency' })

  const queryParams = {
    limit: 7,
    page: 1,
  }

  const customers = await router.createCaller(await createContext(event)).contacts.getContacts(queryParams);

  const pricelists = await router.createCaller(await createContext(event)).pricelists.getPricelists({});

  const defaultPricelist = await router.createCaller(await createContext(event)).pricelists.getDefaultPricelist();

  return {
    currency,
    embroideryTypes,
    embroideryPositions,
    customers,
    pricelists,
    defaultPricelistId: defaultPricelist.id
  };

}) satisfies PageServerLoad;