import type { PageServerLoad } from './$types'
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';


export const load = (async (event) => {

  const embroideryTypes = async () => {
    return await router.createCaller(await createContext(event)).options.getOptions({ group: 'embroideryTypes' })
  }

  const embroideryPositions = async () => {
    return await router.createCaller(await createContext(event)).options.getOptions({ group: 'embroideryPositions' })
  }

  const currency = async () => {
    return await router.createCaller(await createContext(event)).options.getOptions({ group: 'currency' })
  }

  const queryParams = {
    limit: 7,
    page: 1,
  }

  const customers = async () => {
    return await router.createCaller(await createContext(event)).contacts.getContacts(queryParams);
  }
  const pricelists = async () => {
    return await router.createCaller(await createContext(event)).pricelists.getPricelists({});
  }
  const defaultPricelist = async () => {
    return await router.createCaller(await createContext(event)).pricelists.getDefaultPricelist();
  }

  return {
    currency: currency(),
    embroideryTypes: embroideryTypes(),
    embroideryPositions: embroideryPositions(),
    customers: customers(),
    pricelists: pricelists(),
    defaultPricelist: defaultPricelist()
  };

}) satisfies PageServerLoad;