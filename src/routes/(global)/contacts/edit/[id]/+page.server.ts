import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

  const queryParams = {
    limit: 3,
    page: 1,
  }

  const contacts = await router.createCaller(await createContext(event)).contacts.getById(parseInt(event.params.id));
  const corporate = await router.createCaller(await createContext(event)).contacts.getCorporate(queryParams);

  return {
    corporateContacts: corporate,
    contact: contacts
  };
}) satisfies PageServerLoad;