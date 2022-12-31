import prisma from '$lib/prisma/client';
import { router } from '$lib/trpc/router';
import { getPagination } from '$lib/utility/pagination.util';
import type { PageServerLoad } from './$types';
import { createContext } from '$lib/trpc/context';

export const load: PageServerLoad = async (event) => {
  const queryParams = {
    limit: 3,
    page: 1,
  }

  const newCorporateContacts = await router.createCaller(await createContext(event)).contacts.getCorporate(queryParams);

  return {
    contacts: newCorporateContacts,
  };
};