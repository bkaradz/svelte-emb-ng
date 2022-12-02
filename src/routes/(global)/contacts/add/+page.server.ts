import prisma from '$lib/prisma/client';
import { getPagination } from '$lib/utility/pagination.util';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const queryParams = {
    limit: 3,
    page: 1,
  }

  const pagination = getPagination(queryParams);

  const baseQuery = {
    take: pagination.limit,
    skip: (pagination.page - 1) * pagination.limit,
    include: {
      email: true,
      phone: true,
      address: true
    }
  };

  const query = {
    ...baseQuery,
    where: {
      isActive: true,
      isCorporate: true
    },
  };


  const corporatePromise = await prisma.contacts.findMany(query);

  const [corporateContacts] = await Promise.all([corporatePromise]);

  const newCorporateContacts = { results: corporateContacts, ...pagination }

  return {
    contacts: newCorporateContacts,
  };
};