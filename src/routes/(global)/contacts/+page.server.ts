import type { PageServerLoad } from './$types'
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load: PageServerLoad = async (event) => {

  const contacts = await router.createCaller(await createContext(event)).contacts.getContacts({});

  return {
    customers: contacts,
  };

};